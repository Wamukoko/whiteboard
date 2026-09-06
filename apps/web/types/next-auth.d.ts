import type { DefaultSession } from "next-auth";
import type { Role } from "@whb/config";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roles: Role[];
    } & DefaultSession["user"];
  }

  interface User {
    roles: Role[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid: string;
    roles: Role[];
  }
}