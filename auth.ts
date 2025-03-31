import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import Account from "@/database/Account";
import RegistrationRequest from "@/database/RegistrationRequest";
import User, { UserRole } from "@/database/User"; // Importa UserRole dallo schema User
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
              role: user.role, // Aggiungi ruolo
              isVerified: true,
              bio: user.bio,
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
          role: user.role, // Aggiungi ruolo
          isVerified: account.isVerified,
          bio: user.bio,
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
            role: "user" as UserRole, // Cast esplicito a UserRole
            accounts: [],
            bio: "",
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
          // Crei l'account con Account.create() e lo assegni a newGoogleAccount
          const newGoogleAccount = await Account.create({
            user: existingUser._id, // Già un ObjectId
            provider: "google",
            providerId: user.id,
            isVerified: true,
          });

          // Aggiorni l'utente pushando l'_id dell'account appena creato
          await User.findByIdAndUpdate(existingUser._id, {
            $push: { accounts: newGoogleAccount._id },
          });
        }

        // MODIFICA: Aggiungi l'id MongoDB all'oggetto user
        user.id = existingUser._id.toString();
        user.role = existingUser.role; // Aggiungi il ruolo
        user.isVerified = true;

        return true;
      }

      if (account?.provider === "credentials") {
        return true;
      }
      return false;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.username = user.username || user.name;
        token.profileImg = user.profileImg || user.image;
        token.isVerified = user.isVerified;
        token.bio = user.bio;

        // Verifica che il ruolo sia valido
        const userRole = user.role as string;
        if (["user", "author", "editor", "admin"].includes(userRole)) {
          token.role = userRole as UserRole;
        } else {
          token.role = "user" as UserRole; // fallback a user se non valido
        }

        if (account) {
          token.provider = account.provider;
        }
      } else {
        // 🔹 Se il token esiste, ricarica i dati dell'account dal DB
        await dbConnect();

        try {
          // Check if token.id is a valid MongoDB ObjectId
          const user = await User.findById(token.id);
          if (user) {
            // Aggiorna token con i dati più recenti dal database
            token.username = user.username;
            token.profileImg = user.profileImg;
            token.bio = user.bio;

            // Assicurati che il ruolo dal database sia valido per TypeScript
            if (["user", "author", "editor", "admin"].includes(user.role)) {
              token.role = user.role as UserRole;
            } else {
              token.role = "user" as UserRole; // fallback a user se non valido
            }

            // Trova l'account per verificare isVerified
            const accountDoc = await Account.findOne({
              user: token.id,
              provider: token.provider,
            });
            if (accountDoc) {
              token.isVerified = accountDoc.isVerified;
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
        session.user.profileImg = token.profileImg as string;
        session.user.isVerified = token.isVerified as boolean;
        session.user.bio = token.bio as string;

        // Correzione per il tipaggio: assicuriamoci che sia un UserRole valido
        const role = token.role as string;
        if (["user", "author", "editor", "admin"].includes(role)) {
          session.user.role = role as UserRole;
        } else {
          // Se per qualche motivo il ruolo non è valido, impostiamo "user" come fallback
          session.user.role = "user" as UserRole;
        }
      }
      return session;
    },
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.AUTH_SECRET,
});
