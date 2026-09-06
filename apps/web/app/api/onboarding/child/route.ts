import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@whb/db";
import { createChildSchema, zodErrorPayload } from "@whb/shared";
import { apiRequireUser } from "@/lib/session";
import { getPrimaryFamilyMembership } from "@/lib/scope";
import { rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/onboarding/child
 * Creates a LearnerProfile inside the caller's primary family (tenancy
 * root). The LEARNER role is never created standalone — children ride on the
 * family/guardian model (data-model rule 2).
 */
export async function POST(request: NextRequest) {
  const user = await apiRequireUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "Please sign in." } },
      { status: 401 },
    );
  }

  const membership = await getPrimaryFamilyMembership(user.id);
  if (!membership) {
    return NextResponse.json(
      {
        error: {
          code: "NO_FAMILY",
          message: "Create your family before adding a child.",
        },
      },
      { status: 409 },
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

  const parsed = createChildSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(zodErrorPayload(parsed.error), { status: 422 });
  }

  const existingChildren = await prisma.learnerProfile.count({
    where: { familyId: membership.familyId },
  });
  if (existingChildren >= 6) {
    return NextResponse.json(
      {
        error: {
          code: "LIMIT_REACHED",
          message: "This family already has the maximum of 6 child profiles.",
        },
      },
      { status: 409 },
    );
  }

  const child = await prisma.learnerProfile.create({
    data: {
      familyId: membership.familyId,
      fullName: parsed.data.fullName,
      dateOfBirth: parsed.data.dateOfBirth,
      gender: parsed.data.gender.toUpperCase() as
        | "FEMALE"
        | "MALE"
        | "NON_BINARY"
        | "PREFER_NOT_TO_SAY",
      initials: parsed.data.initials || derivedInitials(parsed.data.fullName),
    },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      action: "learner.create",
      scopeType: "family",
      scopeId: membership.familyId,
    },
  });

  return NextResponse.json({ ok: true, data: { child } });
}

function derivedInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]?.slice(0, 2) ?? "?";
  return (parts[0]?.[0] ?? "").toUpperCase() + (parts.at(-1)?.[0] ?? "").toUpperCase();
}