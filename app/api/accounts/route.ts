import { NextRequest, NextResponse } from "next/server";

import Account from "@/database/Account";
import dbConnect from "@/lib/mongoose";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // ✅ Estrai i parametri dalla query string
    const url = new URL(req.url);
    const userId = url.searchParams.get("user");
    const provider = url.searchParams.get("provider");
    const token = url.searchParams.get("token");

    // 🔍 Costruiamo la query dinamicamente in base ai parametri forniti
    let query: Record<string, any> = {};

    if (userId) query.user = userId;
    if (provider) query.provider = provider;
    if (token) query.verificationToken = token;

    console.log("🔍 Query per il recupero degli account:", query);

    // 🔹 Trova gli account nel database
    const accounts = await Account.find(query).populate("user");

    if (!accounts.length) {
      return NextResponse.json(
        { message: "⚠️ Nessun account trovato con i filtri forniti." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "✅ Account trovati con successo!", accounts },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Errore nel recupero degli account:", error);
    return NextResponse.json(
      { error: "❌ Errore interno del server" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    await dbConnect();

    // 🔹 Elimina tutti gli account
    const result = await Account.deleteMany({});

    return NextResponse.json(
      {
        message: `✅ Eliminati ${result.deletedCount} account.`,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Errore durante l'eliminazione degli account:", error);
    return NextResponse.json(
      { error: "❌ Errore interno del server." },
      { status: 500 },
    );
  }
}
