import { prisma } from "@whb/db";

/**
 * Tenancy scoping helpers (ADR-006 / data-model rule 2). Every query touching
 * learner/upload/AI data resolves the owning FamilyAccount here, server-side,
 * before returning anything. Do not scatter this per endpoint.
 */

export async function getPrimaryFamilyMembership(userId: string) {
  return prisma.familyMembership.findFirst({
    where: { userId },
    orderBy: { isAdmin: "desc" },
    include: {
      family: {
        include: { members: { include: { user: true } }, subscription: true },
      },
    },
  });
}

export async function isFamilyAdmin(userId: string, familyId: string) {
  const membership = await prisma.familyMembership.findUnique({
    where: { familyId_userId: { familyId, userId } },
  });
  return membership?.isAdmin ?? false;
}

/** True if the learner belongs to a family the user can administer. */
export async function learnerIsInUserFamilies(userId: string, learnerId: string) {
  const membership = await prisma.familyMembership.findFirst({
    where: { userId },
    include: { family: true },
  });
  if (!membership) return false;
  const learner = await prisma.learnerProfile.findFirst({
    where: { id: learnerId, familyId: membership.familyId },
    select: { id: true },
  });
  return learner !== null;
}