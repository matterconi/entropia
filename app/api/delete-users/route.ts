import { NextResponse } from "next/server";

import User from "@/database/User";
import dbConnect from "@/lib/mongoose";

export async function DELETE() {
  try {
    await dbConnect();

    const result = await User.deleteMany({}); // Cancella tutti gli utenti

    return NextResponse.json(
      { message: `✅ Eliminati ${result.deletedCount} utenti.` },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "❌ Errore durante l'eliminazione degli utenti." },
      { status: 500 },
    );
  }
}
