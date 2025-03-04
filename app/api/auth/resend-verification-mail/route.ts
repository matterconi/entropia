import crypto from "crypto";
import { NextResponse } from "next/server";

import Account from "@/database/Account";
import User from "@/database/User";
import sendVerificationEmail from "@/lib/email/onResendEmail"; // la tua funzione che usa nodemailer
import dbConnect from "@/lib/mongoose";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json(
        { error: "❌ Email obbligatoria." },
        { status: 400 },
      );
    }
    await dbConnect();

    // Trova l'utente associato all'email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "❌ Nessun account trovato con questa email." },
        { status: 400 },
      );
    }

    // Cerca l'account con credenziali associato all'utente
    const account = await Account.findOne({
      user: user._id,
      provider: "credentials",
    });
    if (!account) {
      return NextResponse.json(
        { error: "❌ Nessun account con credenziali trovato." },
        { status: 400 },
      );
    }

    if (account.isVerified) {
      return NextResponse.json(
        { error: "⚠️ Questo account è già verificato." },
        { status: 400 },
      );
    }

    // Genera un nuovo token di verifica per aggiornare l'account
    account.verificationToken = crypto.randomBytes(32).toString("hex");
    await account.save();

    // Invia l'email di verifica usando il token aggiornato
    await sendVerificationEmail(email, account.verificationToken);

    return NextResponse.json(
      { message: "✅ Email di verifica inviata di nuovo!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Errore interno del server:", error);
    return NextResponse.json(
      { error: "❌ Errore interno del server." },
      { status: 500 },
    );
  }
}
