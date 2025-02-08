import { NextResponse } from "next/server";

import Category from "@/database/Category";
import dbConnect from "@/lib/mongoose";

export async function GET() {
  console.log("🔍 Richiesta ricevuta per ottenere tutte le categorie...");

  await dbConnect();

  try {
    const categories = await Category.find().select("name _id").lean();

    console.log(`✅ ${categories.length} categorie trovate.`);
    return NextResponse.json(
      { message: "API funzionante", categories },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Errore nel recupero delle categorie:", error.message);
    return NextResponse.json(
      { message: "Errore nel recupero delle categorie", error: error.message },
      { status: 500 },
    );
  }
}
