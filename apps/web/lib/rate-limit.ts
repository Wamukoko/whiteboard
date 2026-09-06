/**
 * Lightweight in-memory rate limiter for Phase 1 dev/local.
 *
 * Parked here intentionally: production rate limiting runs on Redis via BullMQ
 * workers + an enforcement layer (Phase 4 scope per implementation plan). This
 * in-memory bucket gives API routes a single, swappable interface now.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitOptions {
  /** Max requests allowed within the window. */
  max: number;
  /** Window in seconds. */
  windowSeconds: number;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const windowMs = opts.windowSeconds * 1000;
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: opts.max - 1, retryAfterSeconds: 0 };
  }

  bucket.count += 1;
  if (bucket.count > opts.max) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  return { ok: true, remaining: opts.max - bucket.count, retryAfterSeconds: 0 };
}

/** Best-effort cleanup so the map doesn't grow unbounded. */
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}, 60_000).unref();