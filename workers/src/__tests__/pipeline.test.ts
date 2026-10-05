import { describe, expect, it, vi } from "vitest";
import path from "node:path";
import type Anthropic from "@anthropic-ai/sdk";
import { buildStorageKey, resolveStoragePath, storageRoot } from "../storage";
import {
  assertExtractable,
  extractText,
  ExtractionError,
  MIN_EXTRACTABLE_CHARS,
} from "../extraction";
import {
  AnthropicTranscriber,
  toSupportedImageMediaType,
  type DocumentTranscriber,
} from "../ai/transcriber";

function fakeTranscriber(text = "transcribed"): DocumentTranscriber {
  return {
    provider: "stub",
    model: "stub",
    async transcribe() {
      return { text, inputTokens: 11, outputTokens: 7 };
    },
  };
}

describe("storage keys", () => {
  it("namespaces keys by family", () => {
    const key = buildStorageKey("fam_1", "mat_1", ".pdf");
    expect(key).toBe(path.posix.join("families", "fam_1", "materials", "mat_1.pdf"));
  });

  it("strips path separators and traversal characters from segments", () => {
    const key = buildStorageKey("../../etc", "mat/../../../root", ".pdf");
    expect(key).not.toContain("..");
    expect(key.split(path.posix.sep).every((s) => s !== ".." && s !== "")).toBe(true);
  });

  it("rejects a segment that sanitizes to nothing", () => {
    expect(() => buildStorageKey("!!!", "mat", ".pdf")).toThrow(/empty after sanitization/);
  });

  it("sanitizes the extension too", () => {
    const key = buildStorageKey("fam", "mat", "../../.pdf/../x");
    expect(key.includes("..")).toBe(false);
  });
});

describe("resolveStoragePath", () => {
  it("resolves a normal key inside the root", () => {
    const resolved = resolveStoragePath(buildStorageKey("fam", "mat", ".pdf"));
    expect(resolved.startsWith(storageRoot())).toBe(true);
  });

  it("refuses traversal out of the storage root", () => {
    for (const key of [
      "../../../etc/passwd",
      "families/../../../../Windows/System32/config/sam",
      "..\\..\\secrets.env",
    ]) {
      expect(() => resolveStoragePath(key)).toThrow(/outside storage root/);
    }
  });

  it("refuses an absolute path", () => {
    expect(() => resolveStoragePath(path.resolve("/etc/passwd"))).toThrow(
      /outside storage root/,
    );
  });
});

describe("extractText", () => {
  it("decodes plain text locally without calling the transcriber", async () => {
    const transcriber = {
      provider: "stub",
      model: "stub",
      transcribe: vi.fn(),
    } as unknown as DocumentTranscriber;

    const res = await extractText({
      bytes: new TextEncoder().encode("  Fractions worksheet  "),
      mimeType: "text/plain",
      transcriber,
    });

    expect(res.text).toBe("Fractions worksheet");
    expect(res.inputTokens).toBe(0);
    expect(transcriber.transcribe).not.toHaveBeenCalled();
  });

  it("transcribes images and PDFs", async () => {
    for (const mimeType of ["image/png", "image/jpeg", "application/pdf"]) {
      const res = await extractText({
        bytes: new Uint8Array([1, 2, 3]),
        mimeType,
        transcriber: fakeTranscriber("hello from ocr"),
      });
      expect(res.text).toBe("hello from ocr");
      expect(res.inputTokens).toBe(11);
    }
  });

  it("rejects an unsupported media type", async () => {
    await expect(
      extractText({
        bytes: new Uint8Array([1]),
        mimeType: "application/zip",
        transcriber: fakeTranscriber(),
      }),
    ).rejects.toThrow(/Unsupported upload media type/);
  });
});

describe("assertExtractable", () => {
  it("accepts text at or above the minimum", () => {
    const text = "a".repeat(MIN_EXTRACTABLE_CHARS);
    expect(assertExtractable(text).length).toBe(MIN_EXTRACTABLE_CHARS);
  });

  it("rejects empty text", () => {
    expect(() => assertExtractable("   \n ")).toThrow(ExtractionError);
    expect(() => assertExtractable("   \n ")).toThrow(/No text could be extracted/);
  });

  it("rejects a near-empty scan with actionable guidance", () => {
    expect(() => assertExtractable("1 + 1")).toThrow(/too low-resolution/);
  });

  it("collapses whitespace before measuring", () => {
    const spaced = `${" ".repeat(200)}1 + 1${" ".repeat(200)}`;
    expect(() => assertExtractable(spaced)).toThrow();
  });
});

describe("AnthropicTranscriber", () => {
  it("sends PDFs as a document block", async () => {
    const create = vi.fn((_params: unknown) => ({
      content: [{ type: "text", text: "pdf text" }],
      usage: { input_tokens: 5, output_tokens: 3 },
    }));
    const client = { messages: { create } } as unknown as Anthropic;
    const transcriber = new AnthropicTranscriber({
      apiKey: "k",
      model: "claude-sonnet-5",
      client,
    });

    const res = await transcriber.transcribe({
      bytes: new Uint8Array([1, 2, 3]),
      mimeType: "application/pdf",
    });

    expect(res.text).toBe("pdf text");
    const params = create.mock.calls[0]?.[0] as {
      messages: Array<{ content: Array<{ type: string }> }>;
    };
    expect(params.messages[0]?.content[0]?.type).toBe("document");
  });

  it("sends images as an image block", async () => {
    const create = vi.fn((_params: unknown) => ({
      content: [{ type: "text", text: "image text" }],
      usage: { input_tokens: 5, output_tokens: 3 },
    }));
    const client = { messages: { create } } as unknown as Anthropic;
    const transcriber = new AnthropicTranscriber({
      apiKey: "k",
      model: "claude-sonnet-5",
      client,
    });

    await transcriber.transcribe({ bytes: new Uint8Array([1]), mimeType: "image/png" });

    const params = create.mock.calls[0]?.[0] as {
      messages: Array<{ content: Array<{ type: string }> }>;
    };
    expect(params.messages[0]?.content[0]?.type).toBe("image");
  });

  it("joins multiple text blocks", async () => {
    const client = {
      messages: {
        create: vi.fn(() => ({
          content: [
            { type: "text", text: "part one" },
            { type: "text", text: "part two" },
          ],
          usage: { input_tokens: 1, output_tokens: 1 },
        })),
      },
    } as unknown as Anthropic;
    const transcriber = new AnthropicTranscriber({
      apiKey: "k",
      model: "claude-sonnet-5",
      client,
    });

    const res = await transcriber.transcribe({
      bytes: new Uint8Array([1]),
      mimeType: "image/png",
    });
    expect(res.text).toBe("part one\npart two");
  });

  it("rejects an unsupported image media type", () => {
    expect(() => toSupportedImageMediaType("application/pdf")).toThrow(/Unsupported image/);
  });
});