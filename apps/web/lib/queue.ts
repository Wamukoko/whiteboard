import { aiGenerationQueue } from "@whb/workers/web";
import { GENERATE_QUIZ_JOB, type GenerateQuizJobData } from "@whb/shared";

/**
 * Producer seam between the web app and the `ai-generation` worker.
 *
 * The route never blocks on Redis: if the queue is unreachable the upload still
 * succeeds (material + content rows exist), and the caller marks the content
 * FAILED with a parent-safe reason instead of leaving it QUEUED forever.
 */

/** bound how long we wait for Redis before treating the queue as down. */
const ENQUEUE_TIMEOUT_MS = 4_000;

export async function enqueueQuizGeneration(data: GenerateQuizJobData): Promise<void> {
  const queue = aiGenerationQueue();
  try {
    await withTimeout(queue.add(GENERATE_QUIZ_JOB, data, {
      removeOnComplete: 50,
      removeOnFail: 200,
      attempts: 2,
      backoff: { type: "exponential", delay: 5_000 },
    }), ENQUEUE_TIMEOUT_MS);
  } finally {
    await queue.close().catch(() => {});
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Generation queue timed out")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
