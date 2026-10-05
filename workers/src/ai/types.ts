import type { QuestionDifficulty, QuizPayload } from "@whb/shared";

/**
 * Provider abstraction for quiz generation (Phase 2, ADR-004).
 *
 * The worker depends on this interface, not on any vendor SDK, so swapping
 * providers is a factory change rather than a pipeline rewrite. Every
 * implementation must return a payload that already passed `quizPayloadSchema`
 * and must report real token usage, because the monthly caps are enforced
 * against that number server-side.
 */

export interface GenerationRequest {
  /** Text extracted from the uploaded material. Chunked before each call. */
  sourceText: string;
  curriculumCode: string;
  gradeBand?: string;
  subject?: string;
  questionCount: number;
  difficulty: QuestionDifficulty;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface GenerationResult {
  quiz: QuizPayload;
  usage: TokenUsage;
  provider: string;
  model: string;
}

export interface QuizGenerator {
  readonly provider: string;
  readonly model: string;
  generate(request: GenerationRequest): Promise<GenerationResult>;
}

/** Raised when a provider returns output that fails schema validation. */
export class QuizGenerationError extends Error {
  constructor(
    message: string,
    readonly provider: string,
    readonly model: string,
    override readonly cause?: unknown,
  ) {
    super(message);
    this.name = "QuizGenerationError";
  }
}