import { prisma } from "@whb/db";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";

export interface SubjectStat {
  name: string;
  mastery: number;
  note: string | null;
}

export interface LearnerCardData {
  id: string;
  fullName: string;
  initials: string;
  gradeLabel: string;
  curriculumLabel: string;
  overallMastery: number;
  focusMinutes: number;
  streakDays: number;
  subjects: SubjectStat[];
  remark: string;
  hasEnrollment: boolean;
}

export interface FamilyOverview {
  familyName: string;
  learners: LearnerCardData[];
}

function masteryFrom(answered: number, total: number): number {
  if (total <= 0) return 0;
  const value = Math.round((answered / total) * 100);
  return Math.max(0, Math.min(100, value));
}

function remarkFor(mastery: number, subjectCount: number, enrolled: boolean): string {
  if (!enrolled) return "Curriculum not set yet — pick one to start practice.";
  if (subjectCount === 0) return "Ready for their first practice session.";
  if (mastery < 40) return "A few practice rounds will lift this up.";
  if (mastery >= 85) return "Strong momentum — keep the streak alive.";
  return "On track. Consistent practice keeps it that way.";
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]?.slice(0, 2) ?? "?";
  return (parts[0]?.[0] ?? "").toUpperCase() + (parts.at(-1)?.[0] ?? "").toUpperCase();
}

export async function requireAuthenticatedSession() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Parent surface: one call, tenancy-scoped under the caller's primary family.
 * All aggregation happens here, never in the page component.
 */
export async function getFamilyOverview(userId: string): Promise<FamilyOverview> {
  const primary = await prisma.familyMembership.findFirst({
    where: { userId },
    orderBy: { isAdmin: "desc" },
    include: {
      family: {
        include: {
          learners: {
            where: { status: "ACTIVE" },
            orderBy: { createdAt: "asc" },
            include: {
              enrollments: { include: { curriculum: true } },
              progress: { include: { subject: true } },
            },
          },
        },
      },
    },
  });

  if (!primary) {
    return { familyName: "Your Family", learners: [] };
  }

  const learners: LearnerCardData[] = primary.family.learners.map((learner) => {
    const enrollment = learner.enrollments[0];
    const gradeLabel = enrollment?.gradeBand
      ? `Grade ${enrollment.gradeBand.replace("G", "")} · CBC`
      : enrollment?.curriculum.name ?? "No curriculum yet";
    const curriculumLabel = enrollment?.curriculum.name ?? "—";

    const subjects: SubjectStat[] = learner.progress.map((p) => ({
      name: p.subject.name,
      mastery: masteryFrom(p.masteredUnits, p.totalUnits),
      note: p.note,
    }));

    const overallMastery = subjects.length
      ? Math.round(
          subjects.reduce((acc, s) => acc + s.mastery, 0) / subjects.length,
        )
      : 0;

    const streakDays = 0; // streak telemetry lands with attempts (Phase 2)
    const focusMinutes = 0; // focus-time denormalization deferred until measured

    return {
      id: learner.id,
      fullName: learner.fullName,
      initials: learner.initials ?? initialsFrom(learner.fullName),
      gradeLabel,
      curriculumLabel,
      overallMastery,
      focusMinutes,
      streakDays,
      subjects: subjects.slice(0, 3),
      remark: remarkFor(overallMastery, subjects.length, Boolean(enrollment)),
      hasEnrollment: Boolean(enrollment),
    };
  });

  return { familyName: primary.family.displayName, learners };
}

/** Learner surface: the child the parent is previewing (default: first active). */
export async function getLearnerView(
  userId: string,
  childId?: string,
): Promise<{
  familyName: string;
  child: LearnerCardData | null;
  allLearners: LearnerCardData[];
}> {
  const overview = await getFamilyOverview(userId);
  const allLearners = overview.learners;
  const child =
    allLearners.find((l) => l.id === childId) ?? allLearners[0] ?? null;
  return { familyName: overview.familyName, child, allLearners };
}

export async function getCurriculaCatalog() {
  return prisma.curriculum.findMany({
    orderBy: { code: "asc" },
    include: { subjects: { orderBy: { sequence: "asc" } } },
  });
}