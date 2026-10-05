import { ALLOWED_UPLOAD_MIME_TYPES } from "@whb/shared";
import type { DocumentTranscriber } from "./ai/transcriber";

/**
 * Uploaded material -> plain text (Phase 2 pipeline step 1).
 *
 * Plain text is decoded locally; PDF and images are transcribed by the model.
 * This keeps the common case (a typed worksheet or a .txt export) free and
 * offline-friendly, which matters on the low-bandwidth deployments this product
 * targets.
 */

export interface ExtractionResult {
  text: string;
  /** Tokens spent on OCR, billed to the family even though generation follows. */
  inputTokens: number;
  outputTokens: number;
}

export interface ExtractionRequest {
  bytes: Uint8Array;
  mimeType: string;
  transcriber: DocumentTranscriber;
}

/** Below this, there is not enough source text to ground a quiz in. */
export const MIN_EXTRACTABLE_CHARS = 40;

export async function extractText(request: ExtractionRequest): Promise<ExtractionResult> {
  const { bytes, mimeType } = request;

  if (!(ALLOWED_UPLOAD_MIME_TYPES as readonly string[]).includes(mimeType)) {
    throw new Error(`Unsupported upload media type: ${mimeType}`);
  }

  if (mimeType === "text/plain") {
    const text = new TextDecoder("utf-8").decode(bytes).trim();
    return { text, inputTokens: 0, outputTokens: 0 };
  }

  const transcription = await request.transcriber.transcribe({ bytes, mimeType });
  return {
    text: transcription.text.trim(),
    inputTokens: transcription.inputTokens,
    outputTokens: transcription.outputTokens,
  };
}

export class ExtractionError extends Error {
  constructor(
    message: string,
    override readonly cause?: unknown,
  ) {
    super(message);
    this.name = "ExtractionError";
  }
}

/**
 * Validate extracted text is usable. A near-empty scan of a photographed page
 * should fail loudly here rather than produce a hallucinated quiz.
 */
export function assertExtractable(text: string): string {
  const collapsed = text.replace(/\s+/g, " ").trim();
  if (collapsed.length === 0) {
    throw new ExtractionError("No text could be extracted from this file");
  }
  if (collapsed.length < MIN_EXTRACTABLE_CHARS) {
    throw new ExtractionError(
      `Only ${collapsed.length} characters were extracted (minimum ${MIN_EXTRACTABLE_CHARS}). ` +
        "The scan may be too low-resolution to build a quiz from — try a sharper photo or a typed file.",
    );
  }
  return collapsed;
}