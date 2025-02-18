import { NextResponse } from "next/server";

import Topic from "@/database/Topic";
import dbConnect from "@/lib/mongoose";

export async function GET() {
  console.log("🔍 Richiesta ricevuta per ottenere tutti i topic...");

  await dbConnect();

  try {
    const topics = await Topic.find().select("name _id").lean();

    console.log(`✅ ${topics.length} topic trovati.`);
    return NextResponse.json(
      { message: "API funzionante", topics },
      { status: 200 },
    );
  } catch (error) {
    let errorMessage = "Errore sconosciuto";

    if (error instanceof Error) {
      console.error("❌ Errore nel recupero dei topic:", error.message);
      errorMessage = error.message; // ✅ TypeScript ora riconosce l'errore
    } else {
      console.error("❌ Errore nel recupero dei topic:", error);
    }

    return NextResponse.json(
      { message: "Errore nel recupero dei topic", error: errorMessage },
      { status: 500 },
    );
  }
}
