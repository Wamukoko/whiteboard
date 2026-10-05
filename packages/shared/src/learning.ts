import { z } from "zod";
import { MAX_UPLOAD_BYTES } from "@whb/config";
import {
  MAX_QUIZ_QUESTIONS,
  MIN_QUIZ_QUESTIONS,
} from "./quiz";

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

export const GENERATION_MODELS = ["claude-sonnet-5", "claude-haiku-4-5"] as const;
export type GenerationModel = (typeof GENERATION_MODELS)[number];

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

export const requestQuizGenerationSchema = z.object({
  sourceMaterialId: z.string().min(1, "Source material id is required"),
  learnerId: z.string().min(1, "Learner id is required"),
  questionCount: z
    .number()
    .int()
    .min(MIN_QUIZ_QUESTIONS)
    .max(MAX_QUIZ_QUESTIONS)
    .default(10),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
  model: z.enum(GENERATION_MODELS).default("claude-sonnet-5"),
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
