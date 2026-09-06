export type Role =
  | "SUPER_ADMIN"
  | "PLATFORM_ADMIN"
  | "PARENT_GUARDIAN"
  | "LEARNER"
  | "EDUCATOR"
  | "INSTITUTION_ADMIN"
  | "SCHOLARSHIP_PROVIDER";

export const ROLES: readonly Role[] = [
  "SUPER_ADMIN",
  "PLATFORM_ADMIN",
  "PARENT_GUARDIAN",
  "LEARNER",
  "EDUCATOR",
  "INSTITUTION_ADMIN",
  "SCHOLARSHIP_PROVIDER",
] as const;

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  PLATFORM_ADMIN: "Platform Admin",
  PARENT_GUARDIAN: "Parent / Guardian",
  LEARNER: "Learner",
  EDUCATOR: "Educator",
  INSTITUTION_ADMIN: "Institution Admin",
  SCHOLARSHIP_PROVIDER: "Scholarship Provider",
};

/** Default role assigned at sign-up. Additional roles are granted explicitly. */
export const DEFAULT_SIGNUP_ROLE: Role = "PARENT_GUARDIAN";

/**
 * Guardrail: the learner role is always paired with a parent/guardian and a
 * FamilyAccount. Learner accounts are never created standalone at sign-up.
 */
export const CHILD_ROLE: Role = "LEARNER";
export const PARENT_ROLE: Role = "PARENT_GUARDIAN";

export const REGION_TIMEZONE = "Africa/Nairobi";
export const CURRENCY = "KES";
export const DEFAULT_LOCALE = "en";

/** Supported curriculum families in the MVP (official structure only). */
export const CURRICULUM_FAMILIES = ["CBC", "CAMBRIDGE"] as const;
export type CurriculumFamily = (typeof CURRICULUM_FAMILIES)[number];

/** CBC pilot grade bands (Phase 1 "decisions needed" — scoped pilot). */
export const CBC_PILOT_GRADE_BANDS = [
  { band: "PP1", label: "Pre-Primary 1", sequence: 1 },
  { band: "PP2", label: "Pre-Primary 2", sequence: 2 },
  { band: "G1", label: "Grade 1", sequence: 3 },
  { band: "G2", label: "Grade 2", sequence: 4 },
  { band: "G3", label: "Grade 3", sequence: 5 },
  { band: "G4", label: "Grade 4", sequence: 6 },
  { band: "G5", label: "Grade 5", sequence: 7 },
  { band: "G6", label: "Grade 6", sequence: 8 },
  { band: "G7", label: "Grade 7", sequence: 9 },
  { band: "G8", label: "Grade 8", sequence: 10 },
  { band: "G9", label: "Grade 9", sequence: 11 },
] as const;

export const AI_STATUS_PENDING = "PENDING_REVIEW";
export const AI_STATUS_APPROVED = "APPROVED";
export const AI_STATUS_REJECTED = "REJECTED";

/** Server-side free-tier caps (hard enforced, never client-validated). */
export const DEFAULT_FAMILY_CAPS = {
  maxChildProfiles: 6,
  monthlyQuizCredits: 30,
  maxUploadMb: 15,
  maxStoredMaterialMb: 500,
} as const;

export const GENDER_OPTIONS = ["female", "male", "non-binary", "prefer-not-to-say"] as const;

export const MAX_UPLOAD_BYTES = DEFAULT_FAMILY_CAPS.maxUploadMb * 1024 * 1024;