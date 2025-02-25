// next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      isAuthor: boolean;
      isVerified: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    username: string;
    email: string;
    profileImg?: string;
    isAuthor: boolean;
    isVerified: boolean;
  }
}
