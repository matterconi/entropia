import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

import Account from "@/database/Account";
import dbConnect from "@/lib/mongoose";

// GET: Verifica la validità del token di reset password
export async function GET(req: NextRequest) {
  console.log("DEBUG: In reset-password GET endpoint");
  try {
    // Estrai il token dalla query string
    const token = new URL(req.url).searchParams.get("token");
    console.log("DEBUG: Token dalla query:", token);
    if (!token) {
      console.error("DEBUG: Token non valido o assente");
      return NextResponse.json(
        { error: "❌ Token non valido o assente" },
        { status: 400 },
      );
    }

    await dbConnect();
    console.log("DEBUG: Connessione al DB avvenuta con successo");

    // Cerca l'account tramite il resetToken e popola l'utente associato
    const account = await Account.findOne({ resetToken: token }).populate(
      "user",
    );
    console.log("DEBUG: Risultato della query Account:", account);
    if (!account) {
      console.error("DEBUG: Token di reset non trovato o già usato");
      return NextResponse.json(
        { error: "❌ Token di reset non valido o già usato" },
        { status: 400 },
      );
    }

    // Il token è valido, restituisci un messaggio
    return NextResponse.json(
      { message: "✅ Token valido. Puoi procedere al reset della password." },
      { status: 200 },
    );
  } catch (error) {
    console.error("DEBUG: Errore nel server (GET):", error);
    return NextResponse.json(
      { error: "❌ Errore interno del server" },
      { status: 500 },
    );
  }
}

// POST: Aggiorna la password usando il token
export async function POST(req: NextRequest) {
  console.log("DEBUG: In reset-password POST endpoint");
  try {
    // Estrai il token dalla query string
    const token = new URL(req.url).searchParams.get("token");
    console.log("DEBUG: Token dalla query:", token);
    if (!token) {
      console.error("DEBUG: Token non valido o assente");
      return NextResponse.json(
        { error: "❌ Token non valido o assente" },
        { status: 400 },
      );
    }

    // Estrai la nuova password dal body della richiesta
    const { newPassword } = await req.json();
    if (!newPassword) {
      return NextResponse.json(
        { error: "❌ Nuova password obbligatoria" },
        { status: 400 },
      );
    }

    await dbConnect();
    console.log("DEBUG: Connessione al DB avvenuta con successo");

    // Cerca l'account associato al token di reset
    const account = await Account.findOne({ resetToken: token }).populate(
      "user",
    );
    console.log("DEBUG: Risultato della query Account:", account);
    if (!account) {
      console.error("DEBUG: Token di reset non trovato o già usato");
      return NextResponse.json(
        { error: "❌ Token di reset non valido o già usato" },
        { status: 400 },
      );
    }

    // Hash della nuova password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // Aggiorna la password e rimuovi il resetToken
    account.password = hashedPassword;
    account.resetToken = undefined;
    await account.save();
    console.log(
      "DEBUG: Password aggiornata con successo per l'utente:",
      account.user.email,
    );

    return NextResponse.json(
      { message: "✅ Password aggiornata con successo!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("DEBUG: Errore nel server (POST):", error);
    return NextResponse.json(
      { error: "❌ Errore interno del server" },
      { status: 500 },
    );
  }
}
