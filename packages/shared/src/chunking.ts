/**
 * Document chunking for quiz generation (Phase 2).
 *
 * Worksheets arrive as one arbitrarily long string. Generation runs per chunk so
 * a 40-page pack cannot blow the context window, and chunks overlap so a fact
 * that straddles a boundary is still fully visible to at least one window.
 *
 * Pure and dependency-free so it is unit tested in this package.
 */

export const DEFAULT_CHUNK_MAX_CHARS = 6000;
export const DEFAULT_CHUNK_OVERLAP_CHARS = 400;

export interface ChunkOptions {
  /** Hard ceiling per chunk. Chunks never exceed this. */
  maxChars?: number;
  /** Characters repeated from the tail of the previous chunk. */
  overlapChars?: number;
}

export interface Chunk {
  index: number;
  text: string;
}

/**
 * Split `text` into overlapping chunks, breaking preferentially at paragraph
 * boundaries, then sentences, then whitespace so a chunk rarely starts or ends
 * mid-sentence.
 */
export function chunkText(text: string, options: ChunkOptions = {}): Chunk[] {
  const maxChars = options.maxChars ?? DEFAULT_CHUNK_MAX_CHARS;
  // When a caller narrows maxChars without touching overlapChars, the default
  // overlap would exceed it and throw about a value they never set. Clamp to
  // 20% of the window instead.
  const overlapChars =
    options.overlapChars ?? Math.min(DEFAULT_CHUNK_OVERLAP_CHARS, Math.floor(maxChars * 0.2));

  if (!Number.isFinite(maxChars) || maxChars <= 0) {
    throw new RangeError("maxChars must be a positive finite number");
  }
  if (!Number.isFinite(overlapChars) || overlapChars < 0) {
    throw new RangeError("overlapChars must be a non-negative finite number");
  }
  if (overlapChars >= maxChars) {
    throw new RangeError("overlapChars must be smaller than maxChars");
  }

  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (normalized.length === 0) return [];
  if (normalized.length <= maxChars) return [{ index: 0, text: normalized }];

  const chunks: Chunk[] = [];
  let cursor = 0;

  while (cursor < normalized.length) {
    const hardEnd = Math.min(cursor + maxChars, normalized.length);
    const window = normalized.slice(cursor, hardEnd);

    // A trailing slice that runs to the end of the input is never cut short.
    const end = hardEnd === normalized.length ? hardEnd : findBreakPoint(window, maxChars);

    const body = window.slice(0, end);
    if (body.trim().length > 0) {
      chunks.push({ index: chunks.length, text: body.trim() });
    }

    if (hardEnd === normalized.length) break;

    // Step forward by the chunk body minus the overlap, then re-anchor on a
    // whitespace boundary so the next chunk does not begin mid-word.
    const nextCursor = advanceCursor(cursor, end, overlapChars, normalized);
    if (nextCursor <= cursor) {
      // Defensive: guarantees forward progress on pathological input.
      cursor = hardEnd;
    } else {
      cursor = nextCursor;
    }
  }

  return chunks;
}

/**
 * Choose the largest prefix length <= maxChars that ends on a paragraph,
 * sentence, or whitespace boundary. Falls back to maxChars when the window has
 * no usable boundary.
 */
function findBreakPoint(window: string, maxChars: number): number {
  const minimumUseful = Math.floor(maxChars * 0.5);

  const paragraph = window.lastIndexOf("\n\n", maxChars);
  if (paragraph > minimumUseful) return paragraph + 2;

  const sentence = lastSentenceBreak(window, minimumUseful, maxChars);
  if (sentence > minimumUseful) return sentence;

  const whitespace = window.lastIndexOf(" ", maxChars);
  if (whitespace > minimumUseful) return whitespace + 1;

  return maxChars;
}

function lastSentenceBreak(window: string, from: number, to: number): number {
  for (let i = Math.min(to, window.length - 1); i > from; i -= 1) {
    const char = window[i];
    if (char === "." || char === "!" || char === "?" || char === "\n") {
      // Include the delimiter, and a closing quote/bracket if present.
      return i + 1;
    }
  }
  return -1;
}

function advanceCursor(
  cursor: number,
  end: number,
  overlapChars: number,
  normalized: string,
): number {
  const target = cursor + Math.max(1, end - overlapChars);
  if (target <= cursor) return cursor + 1;
  if (target >= normalized.length) return normalized.length;

  // Do not begin the next chunk mid-word when a boundary is nearby.
  const whitespace = normalized.indexOf(" ", target);
  if (whitespace !== -1 && whitespace - target <= 20) {
    return whitespace + 1;
  }
  return target;
}

/** Rough token estimate for cost accounting and cap enforcement. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}