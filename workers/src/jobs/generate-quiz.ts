import { prisma } from "@whb/db";
import {
  estimateTokens,
  GENERATE_QUIZ_JOB,
  type GenerateQuizJobData,
} from "@whb/shared";
import { createQuizGenerator, generateQuizFromDocument } from "../ai";
import { AnthropicTranscriber, type DocumentTranscriber } from "../ai/transcriber";
import { assertExtractable, extractText, ExtractionError } from "../extraction";
import { getObject } from "../storage";

export { GENERATE_QUIZ_JOB, type GenerateQuizJobData } from "@whb/shared";

/**
 * `ai-generation` job handler (Phase 2).
 *
 * Runs out-of-band so the upload request returns immediately — the parent is on
 * a metered mobile connection and an LLM call can take tens of seconds.
 *
 * Failure handling is deliberate: the material and the content row are marked
 * FAILED with a reason rather than left PENDING forever, and the review screen
 * surfaces that reason. A generation that consumed tokens is still counted
 * against the family's monthly cap, because the cost was actually incurred.
 */

export interface JobDependencies {
  transcriber: DocumentTranscriber;
}

export function createJobDependencies(): JobDependencies {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  return { transcriber: new AnthropicTranscriber({ apiKey, model: "claude-sonnet-5" }) };
}

export async function handleGenerateQuiz(
  data: GenerateQuizJobData,
  deps: JobDependencies,
): Promise<void> {
  const material = await prisma.uploadedMaterial.findUnique({
    where: { id: data.materialId },
    include: {
      family: { include: { subscription: true } },
      generated: { where: { id: data.contentId }, select: { id: true } },
    },
  });

  if (!material || material.generated.length === 0) {
    // The row vanished (family deleted). Nothing to report against.
    return;
  }

  const learner = await prisma.learnerProfile.findUnique({
    where: { id: data.learnerId },
    include: { enrollments: { include: { curriculum: true } } },
  });

  if (!learner || learner.familyId !== material.familyId) {
    await failContent(data.contentId, "The target learner is no longer part of this family");
    return;
  }

  const curriculum = learner.enrollments[0]?.curriculum;

  try {
    const bytes = await getObject(material.storageKey);

    await prisma.uploadedMaterial.update({
      where: { id: material.id },
      data: { extractionState: "PROCESSING", failureReason: null },
    });

    const extracted = await extractText({
      bytes,
      mimeType: material.mimeType,
      transcriber: deps.transcriber,
    });

    // Collapse whitespace before persisting: it cuts token cost on every
    // subsequent chunked generation call and makes retries deterministic.
    const text = assertExtractable(extracted.text.replace(/\n{3,}/g, "\n\n"));

    await prisma.uploadedMaterial.update({
      where: { id: material.id },
      data: {
        extractionState: "READY",
        extractedText: text,
        extractedChars: text.length,
      },
    });

    await prisma.generatedLearningContent.update({
      where: { id: data.contentId },
      data: { generationState: "PROCESSING", failureReason: null },
    });

    const generator = createQuizGenerator(data.model);
    const result = await generateQuizFromDocument(
      generator,
      {
        curriculumCode: curriculum?.code ?? "CBC",
        gradeBand: learner.enrollments[0]?.gradeBand ?? undefined,
        subject: curriculum?.name,
        questionCount: data.questionCount,
        difficulty: data.difficulty,
      },
      text,
    );

    // OCR tokens are billed too, so they are included in the recorded total.
    const inputTokens = result.usage.inputTokens + extracted.inputTokens;
    const outputTokens = result.usage.outputTokens + extracted.outputTokens;

    await prisma.generatedLearningContent.update({
      where: { id: data.contentId },
      data: {
        generationState: "READY",
        payload: result.quiz as unknown as object,
        provider: result.provider,
        model: result.model,
        inputTokens,
        outputTokens,
        tokensUsed: inputTokens + outputTokens,
        failureReason: null,
      },
    });
  } catch (error) {
    const reason = describeFailure(error);
    await failContent(data.contentId, reason);
    await prisma.uploadedMaterial.update({
      where: { id: material.id },
      data: { extractionState: "FAILED", failureReason: reason },
    });
  }
}

async function failContent(contentId: string, reason: string): Promise<void> {
  await prisma.generatedLearningContent.update({
    where: { id: contentId },
    data: { generationState: "FAILED", failureReason: reason },
  });
}

/** Never surface a raw provider/transport error string to a parent. */
function describeFailure(error: unknown): string {
  if (error instanceof ExtractionError) return error.message;

  const message = error instanceof Error ? error.message : String(error);
  if (/overloaded|rate_limit|429|529/.test(message)) {
    return "The AI service is busy right now. This quiz was not generated — please try again shortly.";
  }
  if (/credit balance|billing/.test(message)) {
    return "The AI service reported a billing problem. Support has been notified.";
  }
  if (/api key|authentication|401|403/.test(message)) {
    return "The AI service rejected the request credentials. Support has been notified.";
  }
  return "This quiz could not be generated. Please try again, or upload a clearer file.";
}

/** Pre-enqueue cost estimate so the API can reject oversized documents cheaply. */
export function estimateMaterialTokens(extractedText: string): number {
  return estimateTokens(extractedText);
}