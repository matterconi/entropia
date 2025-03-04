import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

import Account from "@/database/Account";
import User from "@/database/User";
import sendResetPasswordEmail from "@/lib/email/sendResetPasswordEmail";
import dbConnect from "@/lib/mongoose";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    console.log("📩 Email ricevuta:", email);
    if (!email) {
      return NextResponse.json(
        { error: "Email obbligatoria" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Cerca l'utente in base all'email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Account non trovato" },
        { status: 400 },
      );
    }

    // Cerca l'account associato al provider "credentials"
    const account = await Account.findOne({
      user: user._id,
      provider: "credentials",
    });
    if (!account) {
      return NextResponse.json(
        { error: "Account non trovato" },
        { status: 400 },
      );
    }

    // Genera un token per il reset della password
    const resetToken = crypto.randomBytes(32).toString("hex");
    account.resetToken = resetToken;
    await account.save();

    // Invia l'email di reset password
    await sendResetPasswordEmail(email, resetToken);

    return NextResponse.json(
      { message: "Email di reset inviata con successo" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in reset-pass-mail route:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 },
    );
  }
}
