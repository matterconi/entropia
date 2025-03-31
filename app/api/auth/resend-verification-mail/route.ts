import crypto from "crypto";
import { NextResponse } from "next/server";

import RegistrationRequest from "@/database/RegistrationRequest";
import sendVerificationEmail from "@/lib/email/onResendEmail"; // la tua funzione che usa nodemailer
import dbConnect from "@/lib/mongoose";

export async function POST(req: Request) {
  try {
    const { email, registrationToken } = await req.json();

    // Validazione dei dati di input
    if (!email) {
      return NextResponse.json(
        { error: "❌ Email obbligatoria." },
        { status: 400 },
      );
    }

    await dbConnect();

    // Cerca la richiesta di registrazione usando l'email e il token
    let registrationRequest;

    if (registrationToken) {
      // Se è stato fornito un token, cerca per token ed email
      registrationRequest = await RegistrationRequest.findOne({
        email,
        token: registrationToken,
        expiresAt: { $gt: new Date() }, // Controlla che non sia scaduta
      });
    } else {
      // Altrimenti cerca solo per email (prendi la più recente)
      registrationRequest = await RegistrationRequest.findOne({
        email,
        expiresAt: { $gt: new Date() },
      }).sort({ createdAt: -1 });
    }

    if (!registrationRequest) {
      return NextResponse.json(
        {
          error:
            "❌ Nessuna richiesta di registrazione valida trovata per questa email.",
        },
        { status: 400 },
      );
    }

    // Genera un nuovo codice di verifica (mantenendo lo stesso token)
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Aggiorna il codice di verifica
    registrationRequest.verificationCode = verificationCode;

    // Aggiorna la data di scadenza (estendi di altre 24 ore)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    registrationRequest.expiresAt = expiresAt;

    await registrationRequest.save();

    // Invia l'email di verifica con il nuovo codice e token
    await sendVerificationEmail(
      email,
      verificationCode,
      registrationRequest.token,
    );

    return NextResponse.json(
      {
        message: "✅ Email di verifica inviata di nuovo!",
        email: email,
        registrationToken: registrationRequest.token,
      },
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
