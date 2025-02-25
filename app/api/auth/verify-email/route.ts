import { NextResponse } from "next/server";

import User from "@/database/User";
import dbConnect from "@/lib/mongoose";

export async function GET(req: Request) {
  try {
    // ✅ Metodo corretto per estrarre i searchParams dal URL
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      console.error("❌ Errore: Token non trovato nella query string");
      return NextResponse.json(
        { error: "❌ Token non valido" },
        { status: 400 },
      );
    }

    console.log("📩 Token ricevuto:", token);

    await dbConnect();
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      console.error("❌ Errore: Token non trovato nel database");
      return NextResponse.json(
        { error: "❌ Token non valido o già usato" },
        { status: 400 },
      );
    }

    // ✅ Se l'utente è già verificato, restituiamo un messaggio chiaro
    if (user.isVerified) {
      console.warn("⚠️ Utente già verificato:", user.email);
      return NextResponse.json(
        { message: "⚠️ Email già verificata!" },
        { status: 200 },
      );
    }

    // ✅ Verifica l'utente e rimuovi il token
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    console.log("✅ Utente verificato con successo:", user.email);

    return NextResponse.json(
      { message: "✅ Email verificata con successo!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Errore nel server:", error);
    return NextResponse.json(
      { error: "❌ Errore interno del server" },
      { status: 500 },
    );
  }
}
