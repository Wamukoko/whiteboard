import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@whb/db";
import { AI_GENERATED_MARKER } from "@whb/shared";
import { isAuthFailure, resolveParentContext } from "@/lib/learning";

export const runtime = "nodejs";

/**
 * GET /api/assessments?learnerId=… — learner-visible quizzes for the family.
 *
 * Composed so the parent gate is structural rather than cosmetic: this only
 * returns assessments whose source content is APPROVED. A PENDING_REVIEW or
 * REJECTED generation has no `Assessment` row to return.
 */
export async function GET(request: NextRequest) {
  const context = await resolveParentContext();
  if (isAuthFailure(context)) return context.response;
  const { familyId } = context;

  const learnerId = new URL(request.url).searchParams.get("learnerId") ?? undefined;

  const assessments = await prisma.assessment.findMany({
    where: {
      sourceContent: {
        familyId,
        reviewState: "APPROVED",
        ...(learnerId ? { learnerId } : {}),
      },
    },
    orderBy: { id: "desc" },
    take: 50,
    select: {
      id: true,
      title: true,
      _count: { select: { questions: true } },
      sourceContent: { select: { learnerId: true, model: true } },
      attempts: {
        orderBy: { startedAt: "desc" },
        take: 1,
        select: { score: true, maxScore: true, completedAt: true },
      },
    },
  });

  const data = assessments.map((assessment) => ({
    id: assessment.id,
    title: assessment.title,
    questionCount: assessment._count.questions,
    learnerId: assessment.sourceContent?.learnerId ?? null,
    model: assessment.sourceContent?.model ?? null,
    aiGenerated: true,
    label: AI_GENERATED_MARKER,
    lastAttempt: assessment.attempts[0] ?? null,
  }));

  return NextResponse.json({ ok: true, data: { assessments: data } });
}
