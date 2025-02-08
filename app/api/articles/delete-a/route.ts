import { NextResponse } from "next/server";

import Article from "@/database/Article";
import dbConnect from "@/lib/mongoose";

export async function DELETE() {
  try {
    await dbConnect(); // Connessione al database
    const result = await Article.deleteMany({}); // Elimina tutti gli articoli

    return NextResponse.json(
      {
        message: "Tutti gli articoli sono stati eliminati",
        deletedCount: result.deletedCount,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Errore durante la cancellazione",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
