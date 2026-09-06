import { z } from "zod";

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Kenya-first password policy tuned for children's-account safety without
 * punishing mid-range phone keyboards: minimum 8 chars, requires a letter.
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters")
  .regex(/[a-zA-Z]/, "Password must contain at least one letter");

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Full name is required")
    .max(100, "Full name is too long"),
  email: z.string().trim().toLowerCase().regex(EMAIL_RE, "Enter a valid email address"),
  password: passwordSchema,
  confirmPassword: z.string(),
  consent: z.boolean().refine((v) => v === true, {
    message:
      "Parental consent is required to create an account on WhiteBoard",
  }),
});

export type SignupInput = z.infer<typeof signupSchema>;

/** Cross-field check that runs after the per-field rules above. */
export function validateSignup(input: SignupInput) {
  const result = signupSchema.safeParse(input);
  if (!result.success) return result;
  if (input.password !== input.confirmPassword) {
    return {
      success: false as const,
      error: new z.ZodError([
        {
          code: "custom",
          path: ["confirmPassword"],
          message: "Passwords do not match",
        },
      ]),
    };
  }
  return result;
}

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().regex(EMAIL_RE, "Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;