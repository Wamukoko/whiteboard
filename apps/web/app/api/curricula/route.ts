import { NextResponse } from "next/server";
import { prisma } from "@whb/db";

/** Static-able catalog for onboarding: curricula available in the MVP pilot. */
export async function GET() {
  const curricula = await prisma.curriculum.findMany({
    orderBy: { code: "asc" },
  });
  return NextResponse.json({
    ok: true,
    data: { curricula },
  });
}