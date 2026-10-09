import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@whb/db";
import {
  quizPayloadSchema,
  reviewGeneratedContentSchema,
  zodErrorPayload,
} from "@whb/shared";
import { isAuthFailure, resolveParentContext } from "@/lib/learning";

export const runtime = "nodejs";

/**
 * POST /api/generation/[id]/review — parent approves or rejects AI content.
 *
 * This is the parent gate. An `Assessment` is materialized from the quiz payload
 * only on APPROVED, so unreviewed AI output is not merely hidden in the UI — it
 * does not exist as a learner-visible row at all (data-model rule 3).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const context = await resolveParentContext();
  if (isAuthFailure(context)) return context.response;
  const { user, familyId } = context;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid JSON body." } },
      { status: 400 },
    );
  }

  const parsed = reviewGeneratedContentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(zodErrorPayload(parsed.error, "INVALID_REVIEW"), {
      status: 422,
    });
  }

  const content = await prisma.generatedLearningContent.findFirst({
    where: { id, familyId },
    select: {
      id: true,
      generationState: true,
      reviewState: true,
      payload: true,
      learnerId: true,
    },
  });
  if (!content) {
    return NextResponse.json(
      { error: { code: "CONTENT_NOT_FOUND", message: "That content is not in your family." } },
      { status: 404 },
    );
  }

  if (content.generationState !== "READY") {
    return NextResponse.json(
      {
        error: {
          code: "NOT_READY",
          message: "This quiz is not ready for review yet.",
        },
      },
      { status: 409 },
    );
  }

  if (content.reviewState === "APPROVED") {
    return NextResponse.json(
      { error: { code: "ALREADY_REVIEWED", message: "This quiz has already been approved." } },
      { status: 409 },
    );
  }

  const { reviewState, notes } = parsed.data;

  if (reviewState === "REJECTED") {
    const updated = await prisma.generatedLearningContent.update({
      where: { id: content.id },
      data: {
        reviewState: "REJECTED",
        reviewNotes: notes ?? null,
        reviewedById: user.id,
        reviewedAt: new Date(),
      },
      select: { id: true, reviewState: true },
    });
    return NextResponse.json({ ok: true, data: { content: updated } });
  }

  // Approving: the payload must satisfy the quiz contract before it can become
  // learner-visible rows. The worker validated on write; this is the read-side
  // re-validation that makes the invariant hold even if storage was tampered.
  const quiz = quizPayloadSchema.safeParse(content.payload);
  if (!quiz.success) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_PAYLOAD",
          message: "This quiz failed validation and cannot be approved.",
        },
      },
      { status: 422 },
    );
  }

  const assessment = await prisma.$transaction(async (tx) => {
    await tx.generatedLearningContent.update({
      where: { id: content.id },
      data: {
        reviewState: "APPROVED",
        reviewNotes: notes ?? null,
        reviewedById: user.id,
        reviewedAt: new Date(),
      },
    });

    return tx.assessment.create({
      data: {
        title: quiz.data.metadata.title,
        sourceContentId: content.id,
        questions: {
          create: quiz.data.questions.map((question, index) => ({
            sequence: index,
            prompt: question.prompt,
            options: question.type === "SHORT_ANSWER" ? undefined : question.options,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation ?? null,
          })),
        },
      },
      select: { id: true, title: true },
    });
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      action: "content.approve",
      scopeType: "family",
      scopeId: familyId,
    },
  });

  return NextResponse.json({
    ok: true,
    data: { content: { id: content.id, reviewState: "APPROVED" }, assessment },
  });
}
