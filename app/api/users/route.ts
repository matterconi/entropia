import { NextRequest, NextResponse } from "next/server";

import User from "@/database/User";
import dbConnect from "@/lib/mongoose";

export async function GET(req: NextRequest) {
  try {
    await dbConnect(); // Assicura la connessione al database

    // Recupera i parametri di query (opzionale: filtro per email o ID)
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const id = searchParams.get("id");

    let users;

    if (email) {
      // Assicurati di selezionare tutti i campi (incluso role)
      users = await User.findOne({ email })
        .select("+role") // Forza l'inclusione del campo role se è stato definito come select: false nello schema
        .populate("accounts")
        .lean(); // Converte a oggetto JavaScript puro

      if (!users) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    } else if (id) {
      users = await User.findById(id)
        .select("+role")
        .populate("accounts")
        .lean();

      if (!users) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    } else {
      users = await User.find().select("+role").populate("accounts").lean();
    }

    // Per debug, logga i campi dell'utente
    console.log(
      "🔍 Campi utente:",
      users && !Array.isArray(users) ? Object.keys(users) : "N/A",
    );

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    return NextResponse.json(
      { error: "❌ Failed to retrieve users" },
      { status: 500 },
    );
  }
}
