import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextResponse } from "next/server";

import User from "@/database/User";
import sendVerificationEmail from "@/lib/email/sendVerificationEmail"; // ✅ Funzione per inviare email
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
      return NextResponse.json(
        { error: "❌ Questo account esiste già" },
        { status: 400 },
      );
    }

    // ✅ Generiamo il token di verifica
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      profileImg: "/default-profile.png",
      isVerified: false, // ❌ Non verificato di default
      verificationToken, // ✅ Salviamo il token
    });

    await newUser.save();

    // ✅ Inviamo l'email di verifica
    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json(
      { message: "✅ Controlla la tua email per verificare l'account." },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "❌ Errore interno del server" },
      { status: 500 },
    );
  }
}
