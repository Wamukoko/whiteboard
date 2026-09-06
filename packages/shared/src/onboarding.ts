import { z } from "zod";
import { CBC_PILOT_GRADE_BANDS } from "@whb/config";

export const createFamilySchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Family name is required")
    .max(60, "Family name is too long"),
});

export type CreateFamilyInput = z.infer<typeof createFamilySchema>;

export const createChildSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Child's full name is required")
    .max(100, "Child's full name is too long"),
  dateOfBirth: z.coerce.date().refine((d) => {
    const age = Date.now() - d.getTime();
    return age > 0 && age < 22 * 365.25 * 24 * 60 * 60 * 1000;
  }, "Please provide a valid date of birth"),
  gender: z.enum(["female", "male", "non-binary", "prefer-not-to-say"]),
  initials: z
    .string()
    .trim()
    .max(3, "Initials must be at most 3 characters")
    .optional(),
});

export type CreateChildInput = z.infer<typeof createChildSchema>;

const pilotGradeBands = CBC_PILOT_GRADE_BANDS.map((b) => b.band);
const gradeBandEnum = z.enum(pilotGradeBands as [string, ...string[]]);

export const selectCurriculumSchema = z.object({
  childId: z.string().min(1),
  curriculumCode: z.enum(["CBC", "CAMBRIDGE"], {
    message: "Select a curriculum",
  }),
  gradeBand: gradeBandEnum.optional(),
  /** Cambridge stream, e.g. "IGCSE". Kept open until licensing review. */
  stream: z.string().trim().min(1).optional(),
});

export type SelectCurriculumInput = z.infer<typeof selectCurriculumSchema>;