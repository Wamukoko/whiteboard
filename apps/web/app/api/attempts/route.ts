import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@whb/db";
import { gradeQuiz, submitAttemptSchema, zodErrorPayload } from "@whb/shared";
import { isAuthFailure, resolveParentContext } from "@/lib/learning";

export const runtime = "nodejs";

/**
 * POST /api/attempts — submit answers for an approved quiz.
 *
 * The client sends answers only. Score, max score and the target learner are all
 * derived server-side, so a learner cannot self-report a result and cannot pick
 * a learner outside their family. The assessment must belong to the family and
 * be APPROVED, which is the parent gate enforced at submission time too.
 */
export async function POST(request: NextRequest) {
  const context = await resolveParentContext();
  if (isAuthFailure(context)) return context.response;
  const { familyId } = context;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid JSON body." } },
      { status: 400 },
    );
  }

  const parsed = submitAttemptSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(zodErrorPayload(parsed.error, "INVALID_ATTEMPT"), {
      status: 422,
    });
  }

  const { assessmentId, answers } = parsed.data;

  const assessment = await prisma.assessment.findFirst({
    where: { id: assessmentId, sourceContent: { familyId, reviewState: "APPROVED" } },
    select: {
      id: true,
      sourceContent: { select: { learnerId: true } },
      questions: { select: { id: true, correctAnswer: true } },
    },
  });

  if (!assessment || !assessment.sourceContent) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "That quiz is not available." } },
      { status: 404 },
    );
  }

  const questions = assessment.questions.map((question) => ({
    id: question.id,
    correctAnswer: String(question.correctAnswer ?? ""),
  }));

  const result = gradeQuiz(questions, answers);

  const attempt = await prisma.assessmentAttempt.create({
    data: {
      assessmentId: assessment.id,
      learnerId: assessment.sourceContent.learnerId,
      rawAnswers: answers,
      score: result.score,
      maxScore: result.maxScore,
      completedAt: new Date(),
    },
    select: {
      id: true,
      score: true,
      maxScore: true,
      completedAt: true,
      learnerId: true,
    },
  });

  return NextResponse.json({ ok: true, data: { attempt } }, { status: 201 });
}

/** GET /api/attempts?learnerId=… — recent attempts for the progress view. */
export async function GET(request: NextRequest) {
  const context = await resolveParentContext();
  if (isAuthFailure(context)) return context.response;
  const { familyId } = context;

  const learnerId = new URL(request.url).searchParams.get("learnerId") ?? undefined;

  const attempts = await prisma.assessmentAttempt.findMany({
    where: {
      learner: { familyId },
      ...(learnerId ? { learnerId } : {}),
    },
    orderBy: { startedAt: "desc" },
    take: 50,
    select: {
      id: true,
      learnerId: true,
      score: true,
      maxScore: true,
      startedAt: true,
      completedAt: true,
      assessment: { select: { id: true, title: true } },
    },
  });

  return NextResponse.json({ ok: true, data: { attempts } });
}
