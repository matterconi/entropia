import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import Account from "@/database/Account";
import dbConnect from "@/lib/mongoose";

export async function GET(req: NextRequest) {
  console.log("DEBUG: In verify-email endpoint");
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

    // Cerca l'account con il token di verifica e popola l'utente associato
    const account = await Account.findOne({
      verificationToken: token,
    }).populate("user");
    console.log("DEBUG: Risultato della query Account:", account);

    if (!account) {
      console.error("DEBUG: Token non trovato nel database");
      return NextResponse.json(
        { error: "❌ Token non valido o già usato" },
        { status: 400 },
      );
    }

    // Se l'account è già verificato, restituisce un messaggio
    if (account.isVerified) {
      console.warn(
        "DEBUG: Account già verificato per l'utente:",
        account.user.email,
      );
      return NextResponse.json(
        { message: "⚠️ Questo account è già verificato!" },
        { status: 200 },
      );
    }

    // Verifica l'account e rimuove il token
    account.isVerified = true;
    account.verificationToken = undefined;
    await account.save();
    console.log(
      "DEBUG: Account aggiornato come verificato per l'utente:",
      account.user.email,
    );

    // Genera il JWT per il login automatico
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("DEBUG: Missing JWT_SECRET environment variable");
      throw new Error("Missing JWT_SECRET environment variable");
    }
    const jwtToken = jwt.sign(
      { userId: account.user._id, email: account.user.email },
      secret,
      { expiresIn: "1d" },
    );
    console.log("DEBUG: JWT generato:", jwtToken);

    // Restituisce il token insieme ai dati dell'utente
    return NextResponse.json(
      {
        message: "✅ Account verificato con successo!",
        token: jwtToken,
        user: {
          id: account.user._id,
          username: account.user.username,
          email: account.user.email,
          profileImg: account.user.profileImg,
          isAuthor: account.user.isAuthor,
          isVerified: account.isVerified,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("DEBUG: Errore nel server:", error);
    return NextResponse.json(
      { error: "❌ Errore interno del server" },
      { status: 500 },
    );
  }
}
