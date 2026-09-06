import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { Role } from "@whb/config";

const PUBLIC_PATHS = new Set(["/", "/login", "/signup", "/api/health"]);

const PATH_ROLE_REQUIREMENTS: Array<{
  prefix: string;
  roles: Role[];
}> = [
  { prefix: "/parent", roles: ["PARENT_GUARDIAN", "SUPER_ADMIN", "PLATFORM_ADMIN"] },
  { prefix: "/learner", roles: ["LEARNER", "PARENT_GUARDIAN", "EDUCATOR"] },
  { prefix: "/onboarding", roles: ["PARENT_GUARDIAN"] },
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.has(pathname) || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  const signedIn = Boolean(token?.uid);
  if (!signedIn) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const roles = (token?.roles as Role[]) ?? [];

  if ((pathname.startsWith("/login") || pathname.startsWith("/signup")) && signedIn) {
    return NextResponse.redirect(new URL("/parent", request.url));
  }

  for (const rule of PATH_ROLE_REQUIREMENTS) {
    if (pathname.startsWith(rule.prefix) && !roles.some((r) => rule.roles.includes(r))) {
      const fallback = roles.includes("PARENT_GUARDIAN") ? "/parent" : "/onboarding";
      return NextResponse.redirect(new URL(fallback, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icons/).*)",
  ],
};