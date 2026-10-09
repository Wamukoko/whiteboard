import { NextResponse } from "next/server";
import { prisma } from "@whb/db";
import { DEFAULT_FAMILY_CAPS, MAX_UPLOAD_BYTES } from "@whb/config";
import { ALLOWED_UPLOAD_MIME_TYPES } from "@whb/shared";
import { apiRequireUser, type SessionUser } from "@/lib/session";
import { getPrimaryFamilyMembership } from "@/lib/scope";

/**
 * Phase 2 parents. Tenancy is resolved here and nowhere else: every learning
 * route calls `resolveParentContext`, so a request can never name its own
 * familyId (data-model rule 2).
 */

export const MONTHLY_QUIZ_CREDITS = DEFAULT_FAMILY_CAPS.monthlyQuizCredits;

export interface ParentContext {
  user: SessionUser;
  familyId: string;
}

type AuthFailure = { response: NextResponse };
type AuthResult = ParentContext | AuthFailure;

export function isAuthFailure(result: AuthResult): result is AuthFailure {
  return "response" in result;
}

export async function resolveParentContext(): Promise<AuthResult> {
  const user = await apiRequireUser();
  if (!user) {
    return {
      response: NextResponse.json(
        { error: { code: "UNAUTHENTICATED", message: "Please sign in." } },
        { status: 401 },
      ),
    };
  }

  const membership = await getPrimaryFamilyMembership(user.id);
  if (!membership) {
    return {
      response: NextResponse.json(
        {
          error: {
            code: "NO_FAMILY",
            message: "Create your family before managing learning content.",
          },
        },
        { status: 409 },
      ),
    };
  }

  return { user, familyId: membership.familyId };
}

/** UTC month boundary — cap counting must not depend on server timezone. */
export function startOfMonthUtc(now: Date = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

/**
 * Hard cap counter. Reads GeneratedLearningContent rather than a separate
 * ledger: a generation that failed after incurring OCR/LLM cost is still a
 * charged generation, so counting rows (not successes) is the correct unit.
 */
export async function countMonthlyGenerations(familyId: string): Promise<number> {
  return prisma.generatedLearningContent.count({
    where: { familyId, createdAt: { gte: startOfMonthUtc() } },
  });
}

export interface CapCheck {
  allowed: boolean;
  used: number;
  limit: number;
}

export async function checkMonthlyQuizCap(familyId: string): Promise<CapCheck> {
  const used = await countMonthlyGenerations(familyId);
  return { allowed: used < MONTHLY_QUIZ_CREDITS, used, limit: MONTHLY_QUIZ_CREDITS };
}

/** MIME -> extension map. We never trust a user-supplied filename extension. */
const MIME_EXTENSION: Record<(typeof ALLOWED_UPLOAD_MIME_TYPES)[number], string> = {
  "application/pdf": "pdf",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "text/plain": "txt",
};

export function extensionForMime(mimeType: string): string | null {
  return MIME_EXTENSION[mimeType as keyof typeof MIME_EXTENSION] ?? null;
}

export function isAllowedMimeType(mimeType: string): boolean {
  return (ALLOWED_UPLOAD_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function uploadLimitBytes(): number {
  return MAX_UPLOAD_BYTES;
}
