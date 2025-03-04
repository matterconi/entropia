import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import Account from "@/database/Account";
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
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        await dbConnect();

        // Se è presente un token, usalo per la verifica passwordless
        if (credentials?.token) {
          try {
            const decoded = jwt.verify(
              credentials.token as string,
              process.env.JWT_SECRET!, // Forza il non-null assertion
            ) as { userId: string; email: string };

            const user = await User.findById(decoded.userId);
            if (!user) {
              throw new Error("❌ Utente non trovato");
            }
            return {
              id: user._id.toString(),
              username: user.username,
              email: user.email,
              profileImg: user.profileImg,
              isAuthor: user.isAuthor,
              isVerified: true,
            };
          } catch (error) {
            throw new Error("❌ Token non valido o scaduto");
          }
        }

        // Se non viene passato un token, utilizza il flusso email/password
        // 1️⃣ Trova l'utente per email
        const user = await User.findOne({ email: credentials?.email });
        if (!user) {
          throw new Error("❌ Questo account non esiste");
        }

        // 2️⃣ Trova l'account associato all'utente (solo credenziali)
        const account = await Account.findOne({
          user: user._id,
          provider: "credentials",
        }).select("+password +isVerified");
        if (!account || !account.password) {
          throw new Error("❌ Nessun accesso con credenziali trovato.");
        }

        // 3️⃣ Verifica la password
        const isValid = await bcrypt.compare(
          credentials!.password as string,
          account.password,
        );
        if (!isValid) {
          throw new Error("❌ Password errata");
        }

        return {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          profileImg: user.profileImg,
          isAuthor: user.isAuthor,
          isVerified: account.isVerified,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      await dbConnect();

      if (account?.provider === "google") {
        // Cerca l'utente per email
        let existingUser = await User.findOne({ email: user.email });

        // Se l'utente non esiste, lo creiamo lasciando che Mongoose generi l'_id
        if (!existingUser) {
          existingUser = new User({
            username: user.name,
            email: user.email,
            profileImg: user.image || "/default-profile.png",
            isAuthor: false,
          });
          await existingUser.save();
        }

        // Cerca l'account associato a questo utente con provider "google"
        const googleAccount = await Account.findOne({
          user: existingUser._id,
          provider: "google",
        });

        // Se l'account non esiste, lo creiamo
        if (!googleAccount) {
          await Account.create({
            user: existingUser._id, // This should already be an ObjectId
            provider: "google",
            providerId: user.id,
            isVerified: true,
          });
        }

        return true;
      }

      if (account?.provider === "credentials") {
        return true;
      }
      return false;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.isAuthor = user.isAuthor;
        token.profileImg = user.profileImg;
        token.isVerified = user.isVerified;
      } else {
        // 🔹 Se il token esiste, ricarica i dati dell'account dal DB
        await dbConnect();

        try {
          // Check if token.id is a valid MongoDB ObjectId
          const mongoose = (await import("mongoose")).default;
          const isValidObjectId = mongoose.isValidObjectId(token.id);

          // Only try to find the account if token.id is a valid ObjectId
          if (isValidObjectId) {
            const account = await Account.findOne({ user: token.id });
            if (account) {
              token.isVerified = account.isVerified;
            }
          }
        } catch (error) {
          console.error("Error in JWT callback:", error);
          // Continue with the token as is
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session?.user && token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.isAuthor = token.isAuthor as boolean;
        session.user.profileImg = token.profileImg as string;
        session.user.isVerified = token.isVerified as boolean; // ✅ Estratto dall'account
      }
      return session;
    },
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.AUTH_SECRET,
});
