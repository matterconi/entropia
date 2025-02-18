import { NextRequest, NextResponse } from "next/server";

import Article from "@/database/Article";
import Topic from "@/database/Topic";
import dbConnect from "@/lib/mongoose";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ topic: string }> },
) {
  await dbConnect();

  try {
    let { topic } = await params;

    // ✅ Converti il genere in Title Case per la ricerca nel DB
    topic = topic.charAt(0).toUpperCase() + topic.slice(1).toLowerCase();

    console.log("🔍 Normalizzato nome genere:", topic);

    // ✅ Trova l'ID del genere corrispondente
    const foundTopic = await Topic.findOne({ name: topic }).select("_id");
    if (!foundTopic) {
      console.error("❌ Genere non trovato!");
      return NextResponse.json(
        { message: "Genere non trovato" },
        { status: 404 },
      );
    }

    console.log("✅ Genere trovato, ID:", foundTopic._id);

    // ✅ Recupera gli articoli con quel genere
    const articles = await Article.find({ topics: foundTopic._id })
      .populate("author", "username")
      .populate("categories", "name")
      .populate("genres", "name")
      .populate("topics", "name")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      { message: "API funzionante", articles },
      { status: 200 },
    );
  } catch (error) {
    let errorMessage = "Errore sconosciuto";

    if (error instanceof Error) {
      console.error("❌ Errore API GET:", error.message);
      errorMessage = error.message; // ✅ TypeScript ora riconosce l'errore
    } else {
      console.error("❌ Errore API GET:", error);
    }

    return NextResponse.json(
      { message: "Errore nel recupero degli articoli", error: errorMessage },
      { status: 500 },
    );
  }
}
