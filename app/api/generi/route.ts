import { NextResponse } from "next/server";

import Genre from "@/database/Genre";
import dbConnect from "@/lib/mongoose";

export async function GET() {
  console.log("\ud83d\udd0d Richiesta ricevuta per ottenere tutti i generi...");

  await dbConnect();

  try {
    const genres = await Genre.find().select("name _id").lean();

    console.log(`\u2705 ${genres.length} generi trovati.`);
    return NextResponse.json(
      { message: "API funzionante", genres },
      { status: 200 },
    );
  } catch (error) {
    let errorMessage = "Errore sconosciuto";

    if (error instanceof Error) {
      console.error("❌ Errore nel recupero dei generi:", error.message);
      errorMessage = error.message; // ✅ TypeScript ora riconosce l'errore
    } else {
      console.error("❌ Errore nel recupero dei generi:", error);
    }

    return NextResponse.json(
      { message: "Errore nel recupero dei generi", error: errorMessage },
      { status: 500 },
    );
  }
}
