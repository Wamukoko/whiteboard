import { prisma } from "@whb/db";
import { quizPayloadSchema, type QuizPayload } from "@whb/shared";

/**
 * Server-side aggregation for the Phase 2 library surfaces. Tenancy is locked
 * to the caller's primary family here so page components never touch Prisma.
 */

export interface ReviewQuestion {
  id: string;
  prompt: string;
  options: string[] | null;
  correctAnswer: string;
  explanation: string | null;
}

export interface LibraryContent {
  id: string;
  learnerId: string;
  learnerName: string;
  generationState: "QUEUED" | "PROCESSING" | "READY" | "FAILED";
  reviewState: "PENDING_REVIEW" | "APPROVED" | "REJECTED";
  failureReason: string | null;
  model: string;
  title: string | null;
  questionCount: number;
  questions: ReviewQuestion[];
}

export interface LibraryMaterial {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  extractionState: "PENDING" | "PROCESSING" | "READY" | "FAILED";
  failureReason: string | null;
  createdAt: string;
  contents: LibraryContent[];
}

export interface LibraryLearner {
  id: string;
  fullName: string;
  initials: string;
}

export interface FamilyLibrary {
  familyId: string | null;
  familyName: string;
  learners: LibraryLearner[];
  materials: LibraryMaterial[];
}

/** Parse + normalize a stored quiz payload for the review UI. */
function summarize(payload: unknown): { title: string | null; questions: ReviewQuestion[] } {
  const parsed = quizPayloadSchema.safeParse(payload);
  if (!parsed.success) return { title: null, questions: [] };
  const quiz: QuizPayload = parsed.data;
  return {
    title: quiz.metadata.title,
    questions: quiz.questions.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      options: question.type === "SHORT_ANSWER" ? null : [...question.options],
      correctAnswer: question.correctAnswer,
      explanation: question.explanation ?? null,
    })),
  };
}

export async function getFamilyLibrary(userId: string): Promise<FamilyLibrary> {
  const membership = await prisma.familyMembership.findFirst({
    where: { userId },
    orderBy: { isAdmin: "desc" },
    include: {
      family: {
        include: {
          learners: { where: { status: "ACTIVE" }, orderBy: { createdAt: "asc" } },
          uploads: {
            orderBy: { createdAt: "desc" },
            take: 40,
            include: {
              generated: {
                orderBy: { createdAt: "desc" },
                include: { learner: { select: { id: true, fullName: true } } },
              },
            },
          },
        },
      },
    },
  });

  if (!membership) {
    return { familyId: null, familyName: "Your Family", learners: [], materials: [] };
  }

  const family = membership.family;

  return {
    familyId: family.id,
    familyName: family.displayName,
    learners: family.learners.map((learner) => ({
      id: learner.id,
      fullName: learner.fullName,
      initials: learner.initials ?? learner.fullName.slice(0, 2).toUpperCase(),
    })),
    materials: family.uploads.map((material) => ({
      id: material.id,
      fileName: material.fileName,
      mimeType: material.mimeType,
      sizeBytes: material.sizeBytes,
      extractionState: material.extractionState,
      failureReason: material.failureReason,
      createdAt: material.createdAt.toISOString(),
      contents: material.generated.map((content) => {
        const summary = summarize(content.payload);
        return {
          id: content.id,
          learnerId: content.learnerId,
          learnerName: content.learner.fullName,
          generationState: content.generationState,
          reviewState: content.reviewState,
          failureReason: content.failureReason,
          model: content.model,
          title: summary.title,
          questionCount: summary.questions.length,
          questions: summary.questions,
        };
      }),
    })),
  };
}

export interface LearnerAssessment {
  id: string;
  title: string;
  questionCount: number;
  lastScore: number | null;
  lastMax: number | null;
}

export interface LearnerQuiz {
  id: string;
  title: string;
  questions: { id: string; prompt: string; options: string[] | null }[];
}

/** Load one approved quiz for a learner, scoped to the caller's family. */
export async function getLearnerQuiz(
  userId: string,
  assessmentId: string,
): Promise<LearnerQuiz | null> {
  const membership = await prisma.familyMembership.findFirst({
    where: { userId },
    select: { familyId: true },
  });
  if (!membership) return null;

  const assessment = await prisma.assessment.findFirst({
    where: {
      id: assessmentId,
      sourceContent: { familyId: membership.familyId, reviewState: "APPROVED" },
    },
    select: {
      id: true,
      title: true,
      questions: {
        orderBy: { sequence: "asc" },
        select: { id: true, prompt: true, options: true },
      },
    },
  });
  if (!assessment) return null;

  return {
    id: assessment.id,
    title: assessment.title,
    questions: assessment.questions.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      options: Array.isArray(question.options)
        ? question.options.filter((option): option is string => typeof option === "string")
        : null,
    })),
  };
}
export async function getLearnerAssessments(
  userId: string,
  learnerId: string,
): Promise<LearnerAssessment[]> {
  const membership = await prisma.familyMembership.findFirst({
    where: { userId },
    include: { family: { select: { id: true } } },
  });
  if (!membership) return [];

  const learner = await prisma.learnerProfile.findFirst({
    where: { id: learnerId, familyId: membership.familyId },
    select: { id: true },
  });
  if (!learner) return [];

  const assessments = await prisma.assessment.findMany({
    where: { sourceContent: { familyId: membership.familyId, learnerId, reviewState: "APPROVED" } },
    orderBy: { id: "desc" },
    take: 20,
    select: {
      id: true,
      title: true,
      _count: { select: { questions: true } },
      attempts: {
        orderBy: { startedAt: "desc" },
        take: 1,
        select: { score: true, maxScore: true },
      },
    },
  });

  return assessments.map((assessment) => ({
    id: assessment.id,
    title: assessment.title,
    questionCount: assessment._count.questions,
    lastScore: assessment.attempts[0]?.score ?? null,
    lastMax: assessment.attempts[0]?.maxScore ?? null,
  }));
}
