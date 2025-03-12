import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextResponse } from "next/server";

import Account from "@/database/Account";
import User from "@/database/User";
import sendVerificationEmail from "@/lib/email/sendVerificationEmail";
import dbConnect from "@/lib/mongoose";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "❌ Email e password sono obbligatori" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Verifica se esiste un utente associato a questa email.
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      // Se l'utente non esiste, non creiamo un nuovo utente e restituiamo un errore
      return NextResponse.json(
        {
          error:
            "❌ Non esiste un account Google associato a questa email. Registrati con Google.",
        },
        { status: 400 }
      );
    }

    // Verifica che ci sia un account Google associato all'utente.
    const googleAccount = await Account.findOne({
      user: existingUser._id,
      provider: "google",
    });

    if (!googleAccount) {
      // Se non c'è un account Google, restituisce un errore
      return NextResponse.json(
        {
          error:
            "❌ Non esiste un account Google associato a questa email. Registrati con Google.",
        },
        { status: 400 }
      );
    }

    // Controlla se esiste già un account credentials per questo utente.
    const credentialsAccount = await Account.findOne({
      user: existingUser._id,
      provider: "credentials",
    });

    if (credentialsAccount) {
      return NextResponse.json(
        { error: "❌ Questo account esiste già." },
        { status: 400 }
      );
    }

    // Genera il token di verifica e l'hash della password.
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crea il nuovo account credentials associato all'utente esistente.
    const newAccount = new Account({
      user: existingUser._id,
      provider: "credentials",
      password: hashedPassword,
      isVerified: false, // richiede verifica via email
      verificationToken,
    });

    await newAccount.save();

    // Associa il nuovo account all'utente.
    await User.findByIdAndUpdate(existingUser._id, {
      $push: { accounts: newAccount._id },
    });

    // Invia l'email di verifica.
    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json(
      {
        message:
          "✅ Controlla la tua email per verificare l'account. L'account Google è già associato a questa email e hai aggiunto un account credentials.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Errore durante la registrazione:", error);
    return NextResponse.json(
      { error: "❌ Errore interno del server" },
      { status: 500 }
    );
  }
}
