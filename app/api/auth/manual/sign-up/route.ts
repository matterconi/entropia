import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextResponse } from "next/server";

import Account from "@/database/Account";
import User from "@/database/User";
import sendVerificationEmail from "@/lib/email/sendVerificationEmail";
import dbConnect from "@/lib/mongoose";

export async function POST(req: Request) {
  try {
    const { email, password, username } = await req.json();

    if (!email || !password || !username) {
      return NextResponse.json(
        { error: "❌ Tutti i campi sono obbligatori" },
        { status: 400 },
      );
    }

    await dbConnect();
    let existingUser = await User.findOne({ email });

    if (existingUser) {
      // 🔹 Controlla se esiste già un account Google associato a questo utente
      const hasGoogleAccount = await Account.findOne({
        user: existingUser._id,
        provider: "google",
      });

      if (hasGoogleAccount) {
        return NextResponse.json(
          {
            message:
              "⚠️ Esiste già un account Google associato a questa email. Se vuoi procedere con la registrazione manuale e associare i due account, visita il link apposito.",
            hasGoogleAccount: true,
          },
          { status: 200 },
        );
      }

      // 🔹 Controlla se l'utente ha già un account con credenziali
      const hasCredentialsAccount = await Account.findOne({
        user: existingUser._id,
        provider: "credentials",
      });

      if (hasCredentialsAccount) {
        return NextResponse.json(
          { error: "❌ Questo account esiste già." },
          { status: 400 },
        );
      }
    } else {
      // 🔹 Se l'utente non esiste, creiamolo
      existingUser = new User({
        email: email,
        username: username,
        profileImg: "/default-profile.png",
        isAuthor: false,
        accounts: [], // Assicurati che il campo accounts esista
      });

      await existingUser.save();
    }

    // ✅ Generiamo il token di verifica e hashiamo la password
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔹 Creiamo l'account associato
    const newAccount = new Account({
      user: existingUser._id,
      provider: "credentials",
      password: hashedPassword,
      isVerified: false, // ❌ Richiede verifica email
      verificationToken,
    });

    await newAccount.save();

    // ✅ 🔥 Aggiorniamo l'utente per collegare l'account creato
    await User.findByIdAndUpdate(existingUser._id, {
      $push: { accounts: newAccount._id },
    });

    // ✅ Invia email di verifica
    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json(
      {
        message: "✅ Controlla la tua email per verificare l'account.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Errore durante la registrazione:", error);
    return NextResponse.json(
      { error: "❌ Errore interno del server" },
      { status: 500 },
    );
  }
}
