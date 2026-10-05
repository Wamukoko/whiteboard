import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z
    .string()
    .min(1)
    .default("postgresql://whiteboard:whiteboard@localhost:5432/whiteboard?schema=public"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  APP_NAME: z.string().default("WhiteBoard"),
  // Phase 2: local-disk object storage root. Production swaps in S3/R2 behind
  // the same key scheme (ADR-005); the key namespace never changes.
  STORAGE_ROOT: z.string().default(".whiteboard-storage"),
});

/**
 * Validate and expose the process environment. Uses dev-safe defaults so the
 * shared schema/constants packages can be imported in any context (tests,
 * workers, CLI); production/CI override via real env vars. Secrets come from
 * their own providers, never here.
 */
export function validateEnv(env = process.env) {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    const missing: string[] = [];
    for (const issue of parsed.error.issues) {
      missing.push(`${issue.path.join(".")}: ${issue.message}`);
    }
    throw new Error(`Environment validation failed:\n- ${missing.join("\n- ")}`);
  }
  return parsed.data;
}

export type AppEnv = z.infer<typeof envSchema>;

export const env = validateEnv();

/** Local-disk object storage root for uploaded materials (Phase 2, ADR-005). */
export const STORAGE_ROOT = env.STORAGE_ROOT;