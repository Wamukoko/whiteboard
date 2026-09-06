import { Worker } from "bullmq";
import { connection } from "./queue";

/**
 * WhiteBoard worker process — Phase 1 placeholder.
 *
 * Phase 2 wires the AI generation pipeline here (UploadedMaterial -> OCR ->
 * chunking -> Claude -> structured quiz JSON) plus notifications/calendar in
 * Phase 4. Until then this process is a live, named queue listener with no
 * registered jobs, so `docker compose up` and CI stay green.
 */
export async function startWorker() {
  const worker = new Worker("ai-generation", async () => undefined, {
    connection,
    concurrency: 2,
  });

  worker.on("error", (err) => {
    console.error("[worker] queue error:", err.message);
  });

  worker.on("ready", () => {
    console.log("[worker] ready — no jobs registered yet (Phase 2 wires AI jobs)");
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