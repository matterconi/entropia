import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

import Account from "@/database/Account";
import User from "@/database/User";
import dbConnect from "@/lib/mongoose";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e password sono obbligatori" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Trova l'utente
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Questo account non esiste" },
        { status: 400 },
      );
    }

    // Trova l'account associato al provider "credentials"
    const account = await Account.findOne({
      user: user._id,
      provider: "credentials",
    }).select("+password");
    if (!account) {
      return NextResponse.json(
        {
          error: "Questo account non è stato registrato con email e password.",
        },
        { status: 400 },
      );
    }

    // Verifica la password
    const isPasswordValid = await bcrypt.compare(password, account.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Password errata" }, { status: 400 });
    }

    return NextResponse.json(
      { message: "✅ Login effettuato con successo" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Errore durante il login:", error);
    return NextResponse.json(
      { error: "Errore durante il login" },
      { status: 500 },
    );
  }
}
