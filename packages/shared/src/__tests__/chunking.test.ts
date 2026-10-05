import { describe, expect, it } from "vitest";
import {
  chunkText,
  estimateTokens,
  DEFAULT_CHUNK_MAX_CHARS,
  type Chunk,
} from "../chunking";

/** Read a chunk without tripping `noUncheckedIndexedAccess`. */
function chunkAt(chunks: Chunk[], index: number): Chunk {
  const chunk = chunks[index];
  if (!chunk) throw new Error(`expected a chunk at index ${index}, got ${chunks.length}`);
  return chunk;
}

function makeParagraphs(count: number, size = 200): string {
  return Array.from(
    { length: count },
    (_, i) => `Paragraph ${i}. ${"word ".repeat(Math.floor(size / 5)).trim()}.`,
  ).join("\n\n");
}

describe("chunkText", () => {
  it("returns no chunks for empty or whitespace-only input", () => {
    expect(chunkText("")).toEqual([]);
    expect(chunkText("   \n\n  \t ")).toEqual([]);
  });

  it("returns a single chunk when the text fits", () => {
    const res = chunkText("Short worksheet text.");
    expect(res).toEqual([{ index: 0, text: "Short worksheet text." }]);
  });

  it("never exceeds maxChars", () => {
    const res = chunkText(makeParagraphs(40), { maxChars: 500, overlapChars: 50 });
    expect(res.length).toBeGreaterThan(1);
    for (const chunk of res) {
      expect(chunk.text.length).toBeLessThanOrEqual(500);
    }
  });

  it("covers the whole document with overlap", () => {
    const text = makeParagraphs(30);
    const res = chunkText(text, { maxChars: 500, overlapChars: 100 });

    // Reassembling chunks with overlap removed must recover every character of
    // the source, so no content is dropped between windows.
    let rebuilt = chunkAt(res, 0).text;
    for (let i = 1; i < res.length; i += 1) {
      const prev = chunkAt(res, i - 1).text;
      const curr = chunkAt(res, i).text;
      let overlap = 0;
      const maxOverlap = Math.min(prev.length, curr.length);
      for (let len = maxOverlap; len > 0; len -= 1) {
        if (prev.slice(prev.length - len) === curr.slice(0, len)) {
          overlap = len;
          break;
        }
      }
      rebuilt += curr.slice(overlap);
    }

    expect(rebuilt.replace(/\s+/g, " ")).toBe(text.replace(/\s+/g, " ").trim());
  });

  it("prefers breaking at paragraph boundaries", () => {
    const res = chunkText(makeParagraphs(10), { maxChars: 600, overlapChars: 0 });
    for (const chunk of res.slice(0, -1)) {
      expect(chunk.text.endsWith(".")).toBe(true);
    }
  });

  it("falls back to sentence boundaries when there are no blank lines", () => {
    const text = Array.from({ length: 60 }, (_, i) => `Sentence number ${i} here.`).join(" ");
    const res = chunkText(text, { maxChars: 300, overlapChars: 40 });
    expect(res.length).toBeGreaterThan(1);
    for (const chunk of res) {
      expect(chunk.text.length).toBeLessThanOrEqual(300);
    }
    expect(chunkAt(res, 0).text.endsWith(".")).toBe(true);
  });

  it("handles text with no sentence or word boundaries", () => {
    const res = chunkText("a".repeat(1000), { maxChars: 300, overlapChars: 50 });
    expect(res.length).toBeGreaterThan(1);
    for (const chunk of res) {
      expect(chunk.text.length).toBeLessThanOrEqual(300);
    }
  });

  it("always makes forward progress", () => {
    const res = chunkText("x".repeat(500), { maxChars: 100, overlapChars: 99 });
    expect(res.length).toBeGreaterThan(1);
    for (let i = 1; i < res.length; i += 1) {
      expect(chunkAt(res, i).index).toBe(i);
    }
  });

  it("numbers chunks sequentially from zero", () => {
    const res = chunkText(makeParagraphs(25), { maxChars: 400, overlapChars: 50 });
    res.forEach((chunk, i) => expect(chunk.index).toBe(i));
  });

  it("does not emit whitespace-only chunks", () => {
    const res = chunkText(makeParagraphs(30), { maxChars: 450, overlapChars: 400 });
    for (const chunk of res) {
      expect(chunk.text.trim().length).toBeGreaterThan(0);
    }
  });

  it("normalizes CRLF line endings", () => {
    const res = chunkText("Line one.\r\n\r\nLine two.", { maxChars: 100 });
    expect(chunkAt(res, 0).text).not.toContain("\r");
    expect(chunkAt(res, 0).text).toBe("Line one.\n\nLine two.");
  });

  it("clamps the default overlap when only maxChars is narrowed", () => {
    // Regression: the default 400-char overlap used to exceed a small window
    // and throw about a value the caller never set.
    expect(() => chunkText(makeParagraphs(10), { maxChars: 100 })).not.toThrow();
    const res = chunkText(makeParagraphs(10), { maxChars: 100 });
    expect(res.length).toBeGreaterThan(1);
    for (const chunk of res) {
      expect(chunk.text.length).toBeLessThanOrEqual(100);
    }
  });

  it("defaults to the shared max when no options are given", () => {
    const res = chunkText(makeParagraphs(10));
    for (const chunk of res) {
      expect(chunk.text.length).toBeLessThanOrEqual(DEFAULT_CHUNK_MAX_CHARS);
    }
  });

  it("rejects invalid options", () => {
    expect(() => chunkText("text", { maxChars: 0 })).toThrow(RangeError);
    expect(() => chunkText("text", { maxChars: -1 })).toThrow(RangeError);
    expect(() => chunkText("text", { overlapChars: -1 })).toThrow(RangeError);
    expect(() => chunkText("text", { maxChars: 100, overlapChars: 100 })).toThrow(RangeError);
    expect(() => chunkText("text", { maxChars: 100, overlapChars: 200 })).toThrow(RangeError);
  });
});

describe("estimateTokens", () => {
  it("scales with text length", () => {
    expect(estimateTokens("")).toBe(0);
    expect(estimateTokens("abcd")).toBe(1);
    expect(estimateTokens("abcde")).toBe(2);
  });
});