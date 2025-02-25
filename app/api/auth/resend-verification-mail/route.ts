import crypto from "crypto";
import { NextResponse } from "next/server";

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
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "❌ Nessun account trovato con questa email." },
        { status: 400 },
      );
    }
    if (user.isVerified) {
      return NextResponse.json(
        { error: "⚠️ Questo account è già verificato." },
        { status: 400 },
      );
    }
    // Genera un nuovo token e aggiorna l'utente per sicurezza
    user.verificationToken = crypto.randomBytes(32).toString("hex");
    await user.save();
    // Invia l'email di verifica
    await sendVerificationEmail(email, user.verificationToken);
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
