import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@whb/db";
import { isAuthFailure, resolveParentContext } from "@/lib/learning";

export const runtime = "nodejs";

/**
 * GET /api/assessments/[id] — one approved quiz, safe to hand to a learner.
 *
 * `correctAnswer` is deliberately omitted: grading happens server-side in
 * POST /api/attempts, so the answer key never reaches the browser.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const context = await resolveParentContext();
  if (isAuthFailure(context)) return context.response;
  const { familyId } = context;

  const { id } = await params;

  const assessment = await prisma.assessment.findFirst({
    where: {
      id,
      sourceContent: { familyId, reviewState: "APPROVED" },
    },
    select: {
      id: true,
      title: true,
      sourceContent: { select: { learnerId: true } },
      questions: {
        orderBy: { sequence: "asc" },
        select: { id: true, sequence: true, prompt: true, options: true },
      },
    },
  });

  if (!assessment) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "That quiz is not available." } },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    data: {
      assessment: {
        id: assessment.id,
        title: assessment.title,
        learnerId: assessment.sourceContent?.learnerId ?? null,
        questions: assessment.questions,
      },
    },
  });
}
