import Anthropic from "@anthropic-ai/sdk";
import { quizPayloadSchema, GENERATION_MODELS } from "@whb/shared";
import {
  buildSystemPrompt,
  buildUserPrompt,
  QUIZ_TOOL_NAME,
  quizTool,
} from "./prompt";
import {
  QuizGenerationError,
  type GenerationRequest,
  type GenerationResult,
  type QuizGenerator,
} from "./types";

const PROVIDER_ID = "anthropic";

/** Bounds a single tool call so a runaway generation cannot run up the bill. */
const MAX_OUTPUT_TOKENS = 8000;

export interface AnthropicGeneratorOptions {
  apiKey: string;
  model: string;
  /** Injected in tests; defaults to a real client. */
  client?: Anthropic;
}

export class AnthropicQuizGenerator implements QuizGenerator {
  readonly provider = PROVIDER_ID;
  readonly model: string;

  private readonly client: Anthropic;

  constructor(options: AnthropicGeneratorOptions) {
    if (!options.model || !(GENERATION_MODELS as readonly string[]).includes(options.model)) {
      throw new Error(
        `Unsupported model "${options.model}". Allowed: ${GENERATION_MODELS.join(", ")}`,
      );
    }
    this.model = options.model;
    this.client = options.client ?? new Anthropic({ apiKey: options.apiKey });
  }

  async generate(request: GenerationRequest): Promise<GenerationResult> {
    let message: Awaited<ReturnType<Anthropic["messages"]["create"]>>;

    try {
      message = await this.client.messages.create({
        model: this.model,
        max_tokens: MAX_OUTPUT_TOKENS,
        system: buildSystemPrompt({
          curriculumCode: request.curriculumCode,
          gradeBand: request.gradeBand,
          subject: request.subject,
          difficulty: request.difficulty,
          questionCount: request.questionCount,
        }),
        tools: [quizTool],
        tool_choice: { type: "tool", name: QUIZ_TOOL_NAME, disable_parallel_tool_use: true },
        messages: [{ role: "user", content: buildUserPrompt(request.sourceText) }],
      });
    } catch (cause) {
      throw new QuizGenerationError(
        `Anthropic request failed: ${cause instanceof Error ? cause.message : String(cause)}`,
        this.provider,
        this.model,
        cause,
      );
    }

    const raw = this.extractToolInput(message);
    const parsed = quizPayloadSchema.safeParse(raw);

    if (!parsed.success) {
      throw new QuizGenerationError(
        `Provider output failed quizPayloadSchema: ${parsed.error.issues
          .map((issue) => `${issue.path.join(".") || "<root>"}: ${issue.message}`)
          .join("; ")}`,
        this.provider,
        this.model,
        parsed.error,
      );
    }

    return {
      quiz: parsed.data,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
        totalTokens: message.usage.input_tokens + message.usage.output_tokens,
      },
      provider: this.provider,
      model: this.model,
    };
  }

  private extractToolInput(message: {
    content: Array<{ type: string; input?: unknown; name?: string }>;
    stop_reason: string | null;
  }): unknown {
    const block = message.content.find((part) => part.type === "tool_use");

    if (!block) {
      throw new QuizGenerationError(
        `Provider returned no ${QUIZ_TOOL_NAME} tool call (stop_reason=${message.stop_reason})`,
        this.provider,
        this.model,
      );
    }

    return block.input;
  }
}