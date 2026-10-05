import Anthropic from "@anthropic-ai/sdk";

/**
 * Document transcription for OCR (Phase 2).
 *
 * Separate from `QuizGenerator` because transcription and generation are
 * different concerns with different failure modes: a photo of a handwritten
 * worksheet can transcribe poorly even though generation is fine, and that
 * distinction matters when a parent is told why a quiz failed.
 *
 * Claude reads PDFs and images directly, so no tesseract-style wasm payload has
 * to be shipped into the worker process (ADR-005, low-bandwidth deployment).
 */

const TRANSCRIBE_SYSTEM_PROMPT = [
  "Transcribe the supplied document exactly as it appears.",
  "",
  "Rules:",
  "- Reproduce all visible text, preserving reading order and question numbering.",
  "- Keep mathematical notation, tables and diagram labels as plain text.",
  "- Do not answer, summarise, correct or reinterpret anything.",
  "- If a passage is illegible, write [illegible] in its place rather than guessing.",
  "- Reply with the transcription only. No preamble, no commentary.",
].join("\n");

const MAX_OUTPUT_TOKENS = 8000;

export interface TranscriptionRequest {
  bytes: Uint8Array;
  mimeType: string;
}

export interface TranscriptionResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
}

export interface DocumentTranscriber {
  readonly provider: string;
  readonly model: string;
  transcribe(request: TranscriptionRequest): Promise<TranscriptionResult>;
}

export class AnthropicTranscriber implements DocumentTranscriber {
  readonly provider = "anthropic";
  readonly model: string;

  private readonly client: Anthropic;

  constructor(options: { apiKey: string; model: string; client?: Anthropic }) {
    this.model = options.model;
    this.client = options.client ?? new Anthropic({ apiKey: options.apiKey });
  }

  async transcribe(request: TranscriptionRequest): Promise<TranscriptionResult> {
    const data = Buffer.from(request.bytes).toString("base64");

    // The SDK takes PDFs as a `document` block and images as an `image` block;
    // they are not interchangeable.
    const block: Anthropic.ContentBlockParam =
      request.mimeType === "application/pdf"
        ? {
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data },
          }
        : {
            type: "image",
            source: {
              type: "base64",
              media_type: toSupportedImageMediaType(request.mimeType),
              data,
            },
          };

    const message = await this.client.messages.create({
      model: this.model,
      max_tokens: MAX_OUTPUT_TOKENS,
      system: TRANSCRIBE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: [block] }],
    });

    const text = message.content
      .filter((part): part is Extract<typeof part, { type: "text" }> => part.type === "text")
      .map((part) => part.text)
      .join("\n")
      .trim();

    return {
      text,
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
    };
  }
}

/** Only the image media types Claude accepts as a base64 source. */
export function toSupportedImageMediaType(
  mimeType: string,
): "image/png" | "image/jpeg" | "image/gif" | "image/webp" {
  switch (mimeType) {
    case "image/png":
    case "image/jpeg":
    case "image/gif":
    case "image/webp":
      return mimeType;
    default:
      throw new Error(`Unsupported image media type for transcription: ${mimeType}`);
  }
}