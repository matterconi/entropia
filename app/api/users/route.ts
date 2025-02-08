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
      users = await User.findOne({ email });
      if (!users) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    } else if (id) {
      users = await User.findById(id);
      if (!users) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    } else {
      users = await User.find(); // Recupera tutti gli utenti
    }

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    return NextResponse.json(
      { error: "❌ Failed to retrieve users" },
      { status: 500 },
    );
  }
}
