import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@whb/db";
import { validateSignup, zodErrorPayload } from "@whb/shared";
import { rateLimit } from "@/lib/rate-limit";
import { cryptoHashIp } from "@/lib/ip";

/**
 * POST /api/auth/signup
 * Creates the user, assigns the PARENT_GUARDIAN role, and provisions their
 * primary FamilyAccount (the tenancy root). Parental consent is required and
 * enforced client-side and server-side (signupSchema.consent).
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const limit = rateLimit(`signup:${ip}`, { max: 5, windowSeconds: 600 });
  if (!limit.ok) {
    return NextResponse.json(
      {
        error: {
          code: "RATE_LIMITED",
          message: `Too many attempts. Try again in ${limit.retryAfterSeconds}s.`,
        },
      },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
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

  const result = validateSignup(body as Parameters<typeof validateSignup>[0]);
  if (!result.success) {
    return NextResponse.json(zodErrorPayload(result.error, "INVALID_SIGNUP"), {
      status: 422,
    });
  }

  const { name, email, password } = result.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      {
        error: {
          code: "EMAIL_TAKEN",
          message: "An account with this email already exists. Try signing in.",
          fieldErrors: { email: ["This email is already registered."] },
        },
      },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const firstName = name.trim().split(/\s+/)[0] ?? "My";

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        name: name.trim(),
        email,
        passwordHash,
        roles: {
          create: [{ role: "PARENT_GUARDIAN" }],
        },
      },
    });

    const family = await tx.familyAccount.create({
      data: {
        displayName: `${firstName} Family`,
        members: {
          create: [{ userId: created.id, isAdmin: true }],
        },
        subscription: {
          create: { tier: "FREE", status: "ACTIVE" },
        },
      },
    });

    await tx.auditLog.create({
      data: {
        actorUserId: created.id,
        action: "signup.createFamily",
        scopeType: "family",
        scopeId: family.id,
        ipHash: cryptoHashIp(ip),
      },
    });

    return created;
  });

  return NextResponse.json({
    ok: true,
    data: { userId: user.id, email: user.email },
  });
}