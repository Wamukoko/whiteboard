import { Queue, type ConnectionOptions } from "bullmq";

/**
 * Single shared Redis connection for the worker process (ADR-005).
 * Cross-compiles against BullMQ's RedisOptions union member.
 */
export const connection = {
  host: process.env.REDIS_HOST ?? "localhost",
  port: Number(process.env.REDIS_PORT ?? 6379),
} as const satisfies { host: string; port: number };

/** Producer handle the web app enqueues through (import in apps/web Phase 2). */
export function aiGenerationQueue() {
  return new Queue("ai-generation", {
    connection: {
      host: connection.host,
      port: connection.port,
    } satisfies ConnectionOptions,
  });
}

export { Redis } from "ioredis";