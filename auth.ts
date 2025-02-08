import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import User from "@/database/User";
import dbConnect from "@/lib/mongoose";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await dbConnect(); // Connetti al TUO database

        let existingUser = await User.findOne({ email: user.email });

        // Se l'utente non esiste, lo creiamo nel database
        if (!existingUser) {
          existingUser = new User({
            username: user.name, // Nome da Google
            email: user.email,
            profileImg: user.image || "/default-profile.png",
            isAuthor: false, // Valore di default
          });
          await existingUser.save();
          console.log(`✅ Nuovo utente creato: ${existingUser.email}`);
        } else {
          console.log(`🔄 Utente già esistente: ${existingUser.email}`);
        }

        return true; // Login permesso
      }
      return false;
    },

    async session({ session }) {
      if (session?.user) {
        await dbConnect();
        const dbUser = await User.findOne({ email: session.user.email });

        if (dbUser) {
          session.user.id = dbUser._id.toString();
          session.user.username = dbUser.username;
          session.user.isAuthor = dbUser.isAuthor;
          session.user.profileImg = dbUser.profileImg;
        }
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});
