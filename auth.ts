import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import User from "@/database/User";
import dbConnect from "@/lib/mongoose";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect();
        // Cerca l'utente nel database e seleziona anche la password
        const user = await User.findOne({ email: credentials?.email }).select(
          "+password",
        );
        if (!user) {
          throw new Error("❌ Questo account non esiste");
        }
        // Verifica che la password sia corretta
        const isValid = await bcrypt.compare(
          credentials!.password as string,
          user.password!,
        );

        if (!isValid) {
          throw new Error("❌ Password errata");
        }
        // Restituisci l'oggetto utente che verrà inserito nella sessione
        return {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          profileImg: user.profileImg,
          isAuthor: user.isAuthor,
          isVerified: user.isVerified,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await dbConnect();
        let existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          existingUser = new User({
            username: user.name, // Nome da Google
            email: user.email,
            profileImg: user.image || "/default-profile.png",
            isAuthor: false,
            isVerified: false, // Aggiungiamo questo campo per coerenza
          });
          await existingUser.save();
          console.log(`✅ Nuovo utente creato: ${existingUser.email}`);
        } else {
          console.log(`🔄 Utente già esistente: ${existingUser.email}`);
        }
        return true;
      }
      // Per il provider "credentials", se authorize ha restituito un utente, ritorniamo true
      if (account?.provider === "credentials") {
        return true;
      }
      return false;
    },

    // JWT callback - Store user details in token
    async jwt({ token, user }) {
      try {
        if (user) {
          // This runs only when the user signs in
          token.id = user.id;
          token.username = user.username;
          token.isAuthor = user.isAuthor;
          token.profileImg = user.profileImg;
          token.isVerified = user.isVerified;
        } else if (token?.email) {
          // Optional: refresh user data from database for long-lived sessions
          // Only do this if you need the most up-to-date user info
          // For better performance, consider removing this or adding a time-based check
          await dbConnect();
          const dbUser = await User.findOne({ email: token.email });
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.username = dbUser.username;
            token.isAuthor = dbUser.isAuthor;
            token.profileImg = dbUser.profileImg;
            token.isVerified = dbUser.isVerified;
          }
        }
        return token;
      } catch (error) {
        console.error("Error in JWT callback:", error);
        return token;
      }
    },

    // Session callback - Copy data from token to session
    async session({ session, token }) {
      try {
        if (session?.user && token) {
          // Send properties from token to client
          session.user.id = token.id as string;
          session.user.username = token.username as string;
          session.user.isAuthor = token.isAuthor as boolean;
          session.user.profileImg = token.profileImg as string;
          session.user.isVerified = token.isVerified as boolean;
        }
        return session;
      } catch (error) {
        console.error("Error in session callback:", error);
        return session;
      }
    },
  },
  session: {
    strategy: "jwt", // Explicitly set JWT strategy
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/login", // Custom sign-in page (optional)
    // error: '/auth/error', // Error page (optional)
  },
});
