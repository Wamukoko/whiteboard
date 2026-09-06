import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Unauthenticated liveness probe for load balancers / uptime checks. */
export function GET() {
  return NextResponse.json({
    ok: true,
    service: "whiteboard",
    time: new Date().toISOString(),
  });
}