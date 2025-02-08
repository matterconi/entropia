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
    console.error("❌ Errore nel recupero dei topic:", error.message);
    return NextResponse.json(
      { message: "Errore nel recupero dei topic", error: error.message },
      { status: 500 },
    );
  }
}
