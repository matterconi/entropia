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
    console.error("\u274c Errore nel recupero dei generi:", error.message);
    return NextResponse.json(
      { message: "Errore nel recupero dei generi", error: error.message },
      { status: 500 },
    );
  }
}
