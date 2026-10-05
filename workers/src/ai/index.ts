import { chunkText, estimateTokens, type Chunk } from "@whb/shared";
import { AnthropicQuizGenerator } from "./anthropic-generator";
import type {
  GenerationRequest,
  GenerationResult,
  QuizGenerator,
  TokenUsage,
} from "./types";

export * from "./types";
export * from "./prompt";
export * from "./transcriber";
export { AnthropicQuizGenerator } from "./anthropic-generator";

/**
 * Build the provider for a request. The API key is read here rather than
 * threaded through callers so it never reaches a job payload or a log line.
 */
export function createQuizGenerator(model: string, apiKey = process.env.ANTHROPIC_API_KEY): QuizGenerator {
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  return new AnthropicQuizGenerator({ apiKey, model });
}

/**
 * Chunked fan-out over a whole document.
 *
 * Each chunk is generated independently, then the partial quizzes are merged
 * into one. Ids are re-sequenced and de-duplicated so the merged payload still
 * satisfies `quizPayloadSchema` (unique ids, enough questions for the minimum).
 * Token usage is summed because caps are billed on the real total.
 */
export async function generateQuizFromDocument(
  generator: QuizGenerator,
  request: Omit<GenerationRequest, "sourceText">,
  documentText: string,
  chunkOptions?: Parameters<typeof chunkText>[1],
): Promise<GenerationResult> {
  const chunks = chunkText(documentText, chunkOptions);

  if (chunks.length === 0) {
    throw new Error("Cannot generate a quiz from empty source text");
  }

  // Spread the requested questions across chunks so a short document does not
  // over-generate and a long one still reaches the target.
  const perChunk = Math.max(1, Math.ceil(request.questionCount / chunks.length));
  const results = await Promise.all(
    chunks.map((chunk) => generator.generate({ ...request, sourceText: chunk.text, questionCount: perChunk })),
  );

  return mergeResults(results, generator);
}

function mergeResults(results: GenerationResult[], generator: QuizGenerator): GenerationResult {
  const first = results[0];
  if (!first) {
    throw new Error("Cannot merge an empty set of generation results");
  }

  const seenTopics = new Set<string>();
  const questions: GenerationResult["quiz"]["questions"] = [];

  for (const result of results) {
    for (const question of result.quiz.questions) {
      // Overlapping windows can surface the same question twice; keep the first.
      const fingerprint = `${question.prompt.trim().toLowerCase()}`;
      if (seenTopics.has(fingerprint)) continue;
      seenTopics.add(fingerprint);
      questions.push(question);
    }
  }

  const usage = results.reduce<TokenUsage>(
    (total, result) => ({
      inputTokens: total.inputTokens + result.usage.inputTokens,
      outputTokens: total.outputTokens + result.usage.outputTokens,
      totalTokens: total.totalTokens + result.usage.totalTokens,
    }),
    { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
  );

  const reindexed = questions.map((question, i) => ({ ...question, id: `q${i + 1}` }));

  return {
    quiz: {
      metadata: first.quiz.metadata,
      questions: reindexed,
    },
    usage,
    provider: generator.provider,
    model: generator.model,
  };
}

/** Estimated cost guard used before enqueueing, so rejects are cheap. */
export function estimateDocumentTokens(documentText: string): number {
  return estimateTokens(documentText);
}

export type { Chunk };