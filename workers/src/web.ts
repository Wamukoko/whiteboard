/**
 * Web-facing barrel for `@whb/workers`.
 *
 * The Next.js app only needs the queue producer and object storage. This barrel
 * deliberately excludes the job handlers, `@anthropic-ai/sdk`, and the worker
 * bootstrap so importing it cannot pull the AI provider into the web bundle.
 */
export { aiGenerationQueue } from "./queue";
export {
  buildStorageKey,
  getObject,
  putObject,
  resolveStoragePath,
  storageRoot,
} from "./storage";
