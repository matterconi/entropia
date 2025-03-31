import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

// Estendiamo il tipo User di NextAuth per includere `isAuthor` e `profileImg`
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      profileImg?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    username: string;
    profileImg?: string;
  }
}
