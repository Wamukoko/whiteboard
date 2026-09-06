import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@whb/db";
import { selectCurriculumSchema, zodErrorPayload } from "@whb/shared";
import { apiRequireUser } from "@/lib/session";
import { learnerIsInUserFamilies } from "@/lib/scope";
import { rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/onboarding/curriculum
 * Enrolls a learner in a curriculum. Enforced server-side:
 *  - the child must belong to the caller's family (tenancy),
 *  - CBC selections require a grade band from the KICD-mapped list,
 *  - Cambridge streams stay open until licensing review (Phase 3/Future).
 */
export async function POST(request: NextRequest) {
  const user = await apiRequireUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Please sign in." } },
      { status: 401 },
    );
  }

  const limit = rateLimit(`onboarding:${user.id}`, {
    max: 30,
    windowSeconds: 3600,
  });
  if (!limit.ok) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Slow down and try again." } },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid JSON body." } },
      { status: 400 },
    );
  }

  const parsed = selectCurriculumSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(zodErrorPayload(parsed.error), { status: 422 });
  }

  const { childId, curriculumCode, gradeBand, stream } = parsed.data;

  const owned = await learnerIsInUserFamilies(user.id, childId);
  if (!owned) {
    return NextResponse.json(
      {
        error: {
          code: "FORBIDDEN",
          message: "This child does not belong to your family.",
        },
      },
      { status: 403 },
    );
  }

  const curriculum = await prisma.curriculum.findUnique({
    where: { code: curriculumCode },
  });
  if (!curriculum) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Unknown curriculum." } },
      { status: 404 },
    );
  }

  if (curriculum.family === "CBC" && !gradeBand) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Select a grade band for the CBC curriculum.",
        },
      },
      { status: 422 },
    );
  }

  const enrollment = await prisma.learnerCurriculum.upsert({
    where: {
      learnerId_curriculumId: { learnerId: childId, curriculumId: curriculum.id },
    },
    update: { gradeBand: gradeBand ?? null, stream: stream ?? null },
    create: {
      learnerId: childId,
      curriculumId: curriculum.id,
      gradeBand: gradeBand ?? null,
      stream: stream ?? null,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      action: "learner.enrollCurriculum",
      scopeType: "family",
      scopeId: curriculum.id,
    },
  });

  return NextResponse.json({ ok: true, data: { enrollment } });
}