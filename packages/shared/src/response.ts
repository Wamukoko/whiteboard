import { z } from "zod";

/** Uniform client-facing error envelope for all API routes. */
export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
  }),
});

export type ApiError = z.infer<typeof apiErrorSchema>;

export const okSchema = <T extends z.ZodTypeAny>(data: T) =>
  z.object({ ok: z.literal(true), data });

/** Zod error -> { field: [messages] } map, safe to send to clients. */
export function toFieldErrors(err: z.ZodError): Record<string, string[]> {
  return err.issues.reduce<Record<string, string[]>>((acc, issue) => {
    const key = issue.path.join(".") || "form";
    acc[key] = acc[key] ?? [];
    acc[key]?.push(issue.message);
    return acc;
  }, {});
}

export function zodErrorPayload(err: z.ZodError, code = "VALIDATION_ERROR") {
  return {
    error: {
      code,
      message: "Please fix the highlighted fields.",
      fieldErrors: toFieldErrors(err),
    },
  } satisfies ApiError;
}