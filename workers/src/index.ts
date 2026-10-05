import { Worker } from "bullmq";
import { connection } from "./queue";
import {
  GENERATE_QUIZ_JOB,
  createJobDependencies,
  handleGenerateQuiz,
  type GenerateQuizJobData,
} from "./jobs/generate-quiz";

/**
 * WhiteBoard worker process.
 *
 * Phase 2 wires the AI generation pipeline here: UploadedMaterial -> OCR ->
 * chunking -> Claude -> structured quiz JSON, plus notifications/calendar in
 * Phase 4.
 */
export async function startWorker() {
  // Resolved once at boot. Failing fast here is deliberate: a worker that
  // accepts jobs it cannot run would leave families staring at a permanent
  // "generating" state.
  const deps = createJobDependencies();

  const worker = new Worker(
    GENERATE_QUIZ_JOB,
    async (job) => handleGenerateQuiz(job.data as GenerateQuizJobData, deps),
    {
      connection,
      concurrency: 2,
    },
  );

  worker.on("error", (err) => {
    console.error("[worker] queue error:", err.message);
  });

  worker.on("failed", (job, err) => {
    console.error(`[worker] job ${job?.id ?? "<unknown>"} failed:`, err.message);
  });

  worker.on("ready", () => {
    console.log(`[worker] ready — handling "${GENERATE_QUIZ_JOB}" jobs`);
  });

  return worker;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startWorker().catch((err) => {
    console.error("[worker] failed to start:", err);
    process.exit(1);
  });
}

export { connection };