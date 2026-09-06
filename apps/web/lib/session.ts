import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { Role } from "@whb/config";

export interface SessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  roles: Role[];
}

/** Read the signed-in user from the JWT session (server components/actions). */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
    roles: session.user.roles,
  };
}

/** Redirect to /login if anonymous, otherwise return the user. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export function hasRole(user: SessionUser | null, ...required: Role[]): boolean {
  if (!user) return false;
  return required.some((r) => user.roles.includes(r));
}

/** Guard helper for API routes: null means "respond 401". */
export async function apiRequireUser(): Promise<SessionUser | null> {
  const user = await getSessionUser();
  return user;
}