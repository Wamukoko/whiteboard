import { z } from "zod";
import { MAX_UPLOAD_BYTES } from "@whb/config";
import {
  MAX_QUIZ_QUESTIONS,
  MIN_QUIZ_QUESTIONS,
} from "./quiz";
import {
  DEFAULT_AI_PROVIDER_ID,
  PROVIDER_IDS,
  defaultModelForProvider,
  isModelAllowed,
  modelsForProvider,
} from "./providers";

/**
 * Phase 2 API request contracts.
 *
 * Tenancy is never accepted from the client: routes derive familyId and the
 * actor from the session (see apps/web/lib/scope.ts). Requests therefore carry
 * only the resource identifiers the caller could legitimately know.
 */

export const ALLOWED_UPLOAD_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "text/plain",
] as const;

export const GENERATION_MODELS = modelsForProvider(DEFAULT_AI_PROVIDER_ID).map(
  (model) => model.id,
);
export type GenerationModel = string;

/** Persisted file metadata. Storage writes happen before this is recorded. */
export const materialMetadataSchema = z.object({
  fileName: z
    .string()
    .trim()
    .min(1, "File name is required")
    .max(255, "File name is too long"),
  mimeType: z.enum(ALLOWED_UPLOAD_MIME_TYPES, {
    message: "Supported formats: PDF, PNG, JPEG, WebP, or plain text",
  }),
  sizeBytes: z
    .number()
    .int()
    .positive("File size must be positive")
    .max(MAX_UPLOAD_BYTES, `File size cannot exceed ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB`),
  storageKey: z.string().min(1, "Storage key is required").max(512),
});

export type MaterialMetadataInput = z.infer<typeof materialMetadataSchema>;

/**
 * Provider + model are data-driven (see ./providers.ts): a request may name
 * any registered provider, and the model must belong to that provider unless
 * the provider accepts arbitrary model ids (self-hosted / OpenAI-compatible).
 * Omitting both falls back to the deployment default.
 */
export const requestQuizGenerationSchema = z
  .object({
    sourceMaterialId: z.string().min(1, "Source material id is required"),
    learnerId: z.string().min(1, "Learner id is required"),
    questionCount: z
      .number()
      .int()
      .min(MIN_QUIZ_QUESTIONS)
      .max(MAX_QUIZ_QUESTIONS)
      .default(10),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
    provider: z.enum(PROVIDER_IDS).default(DEFAULT_AI_PROVIDER_ID),
    model: z.string().trim().min(1).max(120).optional(),
  })
  .transform((value, ctx) => {
    const model = value.model ?? defaultModelForProvider(value.provider);
    if (!isModelAllowed(value.provider, model)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["model"],
        message: `Model "${model}" is not available for provider "${value.provider}".`,
      });
      return z.NEVER;
    }
    return { ...value, model };
  });

export type RequestQuizGenerationInput = z.infer<typeof requestQuizGenerationSchema>;

export const reviewGeneratedContentSchema = z.object({
  reviewState: z.enum(["APPROVED", "REJECTED"], {
    message: "Review state must be APPROVED or REJECTED",
  }),
  notes: z.string().trim().max(2000).optional(),
});

export type ReviewGeneratedContentInput = z.infer<typeof reviewGeneratedContentSchema>;

/**
 * Learner answers only. Score fields are intentionally absent: `gradeQuiz`
 * computes the score server-side so a client cannot self-report a perfect run.
 */
export const submitAttemptSchema = z.object({
  assessmentId: z.string().min(1, "Assessment id is required"),
  answers: z
    .record(z.string(), z.string().max(2000), {
      message: "Answers must be a map of question id to answer",
    })
    .default({}),
});

export type SubmitAttemptInput = z.infer<typeof submitAttemptSchema>;

/**
 * Queue contract between the web producer and the worker consumer.
 *
 * It lives in `shared` rather than next to the worker handler on purpose: the
 * web route only needs the queue name and payload shape, and importing the
 * handler module would drag the Anthropic SDK into the Next.js bundle.
 */
export const GENERATE_QUIZ_JOB = "generate-quiz";

/** BullMQ queue name shared by the web producer and the worker consumer. */
export const AI_GENERATION_QUEUE = "ai-generation";

export interface GenerateQuizJobData {
  materialId: string;
  learnerId: string;
  questionCount: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  provider: string;
  model: string;
  /** Content row created at enqueue time; updated as the job progresses. */
  contentId: string;
}
