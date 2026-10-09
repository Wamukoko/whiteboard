import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@whb/db";
import { createFamilySchema, zodErrorPayload } from "@whb/shared";
import { apiRequireUser } from "@/lib/session";
import { getPrimaryFamilyMembership } from "@/lib/scope";
import { rateLimit } from "@/lib/rate-limit";

/**
 * GET /api/onboarding/family
 * Returns the caller's primary family (if any) plus a learner count, so the
 * onboarding wizard can tell a first-run from "add another child" and skip the
 * naming step that would otherwise loop a parent back to the start.
 */
export async function GET() {
  const user = await apiRequireUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Please sign in." } },
      { status: 401 },
    );
  }

  const membership = await getPrimaryFamilyMembership(user.id);
  if (!membership) {
    return NextResponse.json({ ok: true, data: { family: null } });
  }

  const learnersCount = await prisma.learnerProfile.count({
    where: { familyId: membership.familyId },
  });

  return NextResponse.json({
    ok: true,
    data: {
      family: {
        id: membership.familyId,
        displayName: membership.family.displayName,
        learnersCount,
      },
    },
  });
}

/**
 * POST /api/onboarding/family
 * Creates the user's primary family with the given name (or renames an
 * existing one, e.g., after the parent edits it during onboarding).
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
    max: 20,
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

  const parsed = createFamilySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(zodErrorPayload(parsed.error), { status: 422 });
  }

  const existing = await getPrimaryFamilyMembership(user.id);
  const family = existing
    ? await prisma.familyAccount.update({
        where: { id: existing.familyId },
        data: { displayName: parsed.data.displayName },
      })
    : await prisma.familyAccount.create({
        data: {
          displayName: parsed.data.displayName,
          members: { create: [{ userId: user.id, isAdmin: true }] },
          subscription: { create: { tier: "FREE", status: "ACTIVE" } },
        },
      });

  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      action: existing ? "family.rename" : "family.create",
      scopeType: "family",
      scopeId: family.id,
    },
  });

  return NextResponse.json({ ok: true, data: { family } });
}