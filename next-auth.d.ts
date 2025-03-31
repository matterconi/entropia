// next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";

import { UserRole } from "@/database/User";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      isVerified: boolean;
      bio: string;
      role: UserRole; // Aggiungi il tipo di ruolo
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    username: string;
    email: string;
    profileImg?: string;
    isVerified: boolean;
    bio: string;
    role: UserRole; // Aggiungi il tipo di ruolo
  }
}

// Estendi anche il token JWT
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    isVerified: boolean;
    bio: string;
    role: UserRole; // Aggiungi il tipo di ruolo
    provider?: string;
  }
}
