import { estimateTokens, quizPayloadSchema } from "@whb/shared";
import { buildSystemPrompt, buildUserPrompt, quizTool } from "./prompt";
import {
  QuizGenerationError,
  type GenerationRequest,
  type GenerationResult,
  type QuizGenerator,
  type TokenUsage,
} from "./types";

/**
 * Generic adapter for any OpenAI-compatible chat-completions endpoint (ADR-004).
 *
 * This is the "add an open-source model" path: Ollama, vLLM, LM Studio,
 * llama.cpp's server, OpenRouter, Groq, Together and friends all expose
 * `POST {baseUrl}/chat/completions`, so one adapter covers them all. Provider
 * and model are configuration (`AI_BASE_URL`, `AI_MODEL`), not code.
 *
 * Unlike the Anthropic path (which constrains output with a forced tool call),
 * these servers vary in tool/JSON-schema support, so we request a JSON object
 * and re-validate with the same `quizPayloadSchema`. Token usage is read from
 * the response when present and estimated otherwise, because the monthly caps
 * are billed on real usage.
 */

const PROVIDER_ID = "openai-compatible";
const DEFAULT_MAX_TOKENS = 8000;
const DEFAULT_TIMEOUT_MS = 60_000;

export interface OpenAICompatibleOptions {
  baseUrl: string;
  model: string;
  apiKey?: string;
  maxTokens?: number;
  timeoutMs?: number;
  /** Injected in tests; defaults to the global fetch. */
  fetchImpl?: typeof fetch;
}

interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string | null } }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export class OpenAICompatibleQuizGenerator implements QuizGenerator {
  readonly provider = PROVIDER_ID;
  readonly model: string;

  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly maxTokens: number;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: OpenAICompatibleOptions) {
    if (!options.baseUrl) {
      throw new Error("OpenAI-compatible generator requires a base URL");
    }
    if (!options.model) {
      throw new Error("OpenAI-compatible generator requires a model");
    }
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.model = options.model;
    this.apiKey = options.apiKey ?? "";
    this.maxTokens = options.maxTokens ?? DEFAULT_MAX_TOKENS;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async generate(request: GenerationRequest): Promise<GenerationResult> {
    const system = buildSystemPrompt({
      curriculumCode: request.curriculumCode,
      gradeBand: request.gradeBand,
      subject: request.subject,
      difficulty: request.difficulty,
      questionCount: request.questionCount,
    });
    const user = buildUserPrompt(request.sourceText);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    let response: Response;
    try {
      response = await this.fetchImpl(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: this.maxTokens,
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: this.buildJsonSystemPrompt(system) },
            { role: "user", content: user },
          ],
        }),
        signal: controller.signal,
      });
    } catch (cause) {
      throw new QuizGenerationError(
        `OpenAI-compatible request failed: ${describe(cause)}`,
        this.provider,
        this.model,
        cause,
      );
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      const detail = await safeText(response);
      throw new QuizGenerationError(
        `OpenAI-compatible request failed: HTTP ${response.status}${detail ? ` — ${detail}` : ""}`,
        this.provider,
        this.model,
      );
    }

    let payload: ChatCompletionResponse;
    try {
      payload = (await response.json()) as ChatCompletionResponse;
    } catch (cause) {
      throw new QuizGenerationError(
        `OpenAI-compatible response was not JSON: ${describe(cause)}`,
        this.provider,
        this.model,
        cause,
      );
    }

    const rawText = payload.choices?.[0]?.message?.content ?? "";
    const raw = parseModelJson(rawText, this.provider, this.model);
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
      usage: usageFrom(payload, request.sourceText, rawText),
      provider: this.provider,
      model: this.model,
    };
  }

  /** JSON mode has no schema enforcement, so the shape is spelled out. */
  private buildJsonSystemPrompt(system: string): string {
    return [
      system,
      "",
      "Reply with a single JSON object only. No markdown fences, no commentary.",
      "The object must match this JSON Schema exactly:",
      JSON.stringify(quizTool.input_schema),
    ].join("\n");
  }
}

function parseModelJson(text: string, provider: string, model: string): unknown {
  const trimmed = text.trim();
  const unfenced = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(unfenced);
  } catch (cause) {
    throw new QuizGenerationError(
      `OpenAI-compatible output was not valid JSON: ${describe(cause)}`,
      provider,
      model,
      cause,
    );
  }
}

function usageFrom(
  payload: ChatCompletionResponse,
  sourceText: string,
  outputText: string,
): TokenUsage {
  const usage = payload.usage;
  const inputTokens = usage?.prompt_tokens ?? estimateTokens(sourceText);
  const outputTokens = usage?.completion_tokens ?? estimateTokens(outputText);
  const totalTokens = usage?.total_tokens ?? inputTokens + outputTokens;
  return { inputTokens, outputTokens, totalTokens };
}

async function safeText(response: Response): Promise<string> {
  try {
    return (await response.text()).slice(0, 300);
  } catch {
    return "";
  }
}

function describe(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}
