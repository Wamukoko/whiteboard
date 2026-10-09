import {
  chunkText,
  estimateTokens,
  DEFAULT_AI_PROVIDER_ID,
  PROVIDER_IDS,
  defaultModelForProvider,
  findProvider,
  isModelAllowed,
  type Chunk,
} from "@whb/shared";
import { AnthropicQuizGenerator } from "./anthropic-generator";
import { OpenAICompatibleQuizGenerator } from "./openai-compatible-generator";
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
export { OpenAICompatibleQuizGenerator } from "./openai-compatible-generator";

export interface QuizGeneratorSelection {
  provider?: string;
  model?: string;
}

/**
 * Build the provider for a request from the shared registry (ADR-004).
 *
 * Provider and model are resolved as: explicit selection -> environment
 * (`AI_PROVIDER` / `AI_MODEL`) -> registry default. Credentials are read here,
 * from the provider's own env var, so they never reach a job payload or a log
 * line. Adding a new open-source model is then config, not a code change: point
 * `AI_BASE_URL` at the server and name the model.
 */
export function createQuizGenerator(
  selection: QuizGeneratorSelection = {},
  env: NodeJS.ProcessEnv = process.env,
): QuizGenerator {
  const providerId = selection.provider ?? env.AI_PROVIDER ?? DEFAULT_AI_PROVIDER_ID;
  const provider = findProvider(providerId);
  if (!provider) {
    throw new Error(
      `Unknown AI provider "${providerId}". Known providers: ${PROVIDER_IDS.join(", ")}`,
    );
  }

  const model = selection.model ?? env.AI_MODEL ?? defaultModelForProvider(providerId);
  if (!isModelAllowed(providerId, model)) {
    throw new Error(`Model "${model}" is not available for provider "${providerId}"`);
  }

  const apiKey = provider.apiKeyEnv ? env[provider.apiKeyEnv] : undefined;

  switch (provider.kind) {
    case "anthropic": {
      if (!apiKey) {
        throw new Error(`${provider.apiKeyEnv} is not configured`);
      }
      return new AnthropicQuizGenerator({ apiKey, model });
    }
    case "openai-compatible": {
      const baseUrl = env.AI_BASE_URL ?? provider.defaultBaseUrl;
      if (!baseUrl) {
        throw new Error(
          `Provider "${providerId}" needs AI_BASE_URL (the OpenAI-compatible server root)`,
        );
      }
      // Local servers (Ollama, vLLM) commonly need no key.
      return new OpenAICompatibleQuizGenerator({ baseUrl, apiKey, model });
    }
  }
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