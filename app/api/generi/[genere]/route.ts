import { NextResponse } from "next/server";

import Article from "@/database/Article";
import Genre from "@/database/Genre";
import dbConnect from "@/lib/mongoose";

export async function GET(req, context) {
  console.log("🔍 Richiesta ricevuta per il genere:", context.params.genere);

  await dbConnect();

  try {
    let { genere } = context.params;

    // ✅ Converti il genere in Title Case per la ricerca nel DB
    genere = genere.charAt(0).toUpperCase() + genere.slice(1).toLowerCase();

    console.log("🔍 Normalizzato nome genere:", genere);

    // ✅ Trova l'ID del genere corrispondente
    const genre = await Genre.findOne({ name: genere }).select("_id");
    if (!genre) {
      console.error("❌ Genere non trovato!");
      return NextResponse.json(
        { message: "Genere non trovato" },
        { status: 404 },
      );
    }

    console.log("✅ Genere trovato, ID:", genre._id);

    // ✅ Recupera gli articoli con quel genere
    const articles = await Article.find({ genres: genre._id })
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
    console.error("❌ Errore API GET:", error.message);
    return NextResponse.json(
      { message: "Errore nel recupero degli articoli", error: error.message },
      { status: 500 },
    );
  }
}
