import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@whb/db";
import { requestQuizGenerationSchema, zodErrorPayload } from "@whb/shared";
import {
  checkMonthlyQuizCap,
  isAuthFailure,
  resolveParentContext,
} from "@/lib/learning";
import { enqueueQuizGeneration } from "@/lib/queue";

export const runtime = "nodejs";

/**
 * POST /api/generation — request an AI quiz for an uploaded material.
 *
 * Two guards run before a row exists: the material and learner must both be in
 * the caller's family, and the family's monthly credit cap is enforced here,
 * server-side, by counting this month's generated-content rows. The request
 * only enqueues work; the parent review gate is what makes it visible.
 */
export async function POST(request: NextRequest) {
  const context = await resolveParentContext();
  if (isAuthFailure(context)) return context.response;
  const { user, familyId } = context;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid JSON body." } },
      { status: 400 },
    );
  }

  const parsed = requestQuizGenerationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(zodErrorPayload(parsed.error, "INVALID_REQUEST"), {
      status: 422,
    });
  }

  const { sourceMaterialId, learnerId, questionCount, difficulty, model } = parsed.data;

  const material = await prisma.uploadedMaterial.findFirst({
    where: { id: sourceMaterialId, familyId },
    select: { id: true },
  });
  if (!material) {
    return NextResponse.json(
      { error: { code: "MATERIAL_NOT_FOUND", message: "That material is not in your family." } },
      { status: 404 },
    );
  }

  const learner = await prisma.learnerProfile.findFirst({
    where: { id: learnerId, familyId },
    select: { id: true },
  });
  if (!learner) {
    return NextResponse.json(
      { error: { code: "LEARNER_NOT_FOUND", message: "That learner is not in your family." } },
      { status: 404 },
    );
  }

  const cap = await checkMonthlyQuizCap(familyId);
  if (!cap.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "MONTHLY_CAP_REACHED",
          message: `This family has used all ${cap.limit} quiz credits for the month.`,
        },
      },
      { status: 429 },
    );
  }

  const content = await prisma.generatedLearningContent.create({
    data: {
      familyId,
      learnerId,
      sourceMaterialId,
      contentType: "QUIZ",
      provider: "anthropic",
      model,
      generationState: "QUEUED",
      reviewState: "PENDING_REVIEW",
      // No payload until the worker succeeds; readiness is tracked by
      // generationState, and the review screen never renders a QUEUED row.
      payload: {},
    },
    select: { id: true, learnerId: true, generationState: true, reviewState: true, createdAt: true },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      action: "content.requestGeneration",
      scopeType: "family",
      scopeId: familyId,
    },
  });

  try {
    await enqueueQuizGeneration({
      materialId: sourceMaterialId,
      learnerId,
      questionCount,
      difficulty,
      model,
      contentId: content.id,
    });
  } catch {
    // The queue is unreachable. Fail the content loudly rather than leaving the
    // parent staring at "Generating…" forever; the credit is still counted.
    const failed = await prisma.generatedLearningContent.update({
      where: { id: content.id },
      data: {
        generationState: "FAILED",
        failureReason: "The generation queue is unavailable. Please try again shortly.",
      },
      select: { id: true, generationState: true, failureReason: true },
    });
    return NextResponse.json(
      { ok: true, data: { content: failed, queued: false } },
      { status: 202 },
    );
  }

  return NextResponse.json(
    { ok: true, data: { content, queued: true } },
    { status: 201 },
  );
}
