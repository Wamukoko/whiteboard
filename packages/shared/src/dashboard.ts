import { z } from "zod";

/** Shape clients rely on for dashboard reads. Kept small for Phase 1. */
export const learnerSummarySchema = z.object({
  id: z.string(),
  fullName: z.string(),
  gradeBand: z.string().nullable(),
  curriculumCode: z.string(),
  overallMastery: z.number().min(0).max(100),
  streakDays: z.number().int().nonnegative(),
  focusMinutes: z.number().int().nonnegative(),
  subjects: z.array(
    z.object({
      name: z.string(),
      mastery: z.number().min(0).max(100),
      note: z.string().nullable(),
    }),
  ),
  childCount: z.number().int().positive(),
  familyName: z.string(),
});

export type LearnerSummary = z.infer<typeof learnerSummarySchema>;