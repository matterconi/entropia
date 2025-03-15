import { NextRequest, NextResponse } from "next/server";

import Genre from "@/database/Genre";
import dbConnect from "@/lib/mongoose";

// Lista originale dei generi
const originalGenres = [
  { title: "Romantico" },
  { title: "Azione" },
  { title: "Avventura" },
  { title: "Fantasy" },
  { title: "Fantascienza" },
  { title: "Horror" },
  { title: "Giallo" },
  { title: "Drammatico" },
  { title: "Storico" },
];

/**
 * GET - Ottieni tutti i generi
 */
export async function GET() {
  console.log("🔍 Richiesta ricevuta per ottenere tutti i generi...");

  await dbConnect();

  try {
    const genres = await Genre.find().select("name _id").lean();

    console.log(`✅ ${genres.length} generi trovati.`);
    return NextResponse.json(
      { message: "API funzionante", genres },
      { status: 200 },
    );
  } catch (error) {
    let errorMessage = "Errore sconosciuto";

    if (error instanceof Error) {
      console.error("❌ Errore nel recupero dei generi:", error.message);
      errorMessage = error.message;
    } else {
      console.error("❌ Errore nel recupero dei generi:", error);
    }

    return NextResponse.json(
      { message: "Errore nel recupero dei generi", error: errorMessage },
      { status: 500 },
    );
  }
}

/**
 * POST - Ripristina i generi originali
 */
export async function POST(req: NextRequest) {
  console.log("🔄 API /api/reset-genres: Ripristino generi originali...");

  await dbConnect();

  try {
    // Fase 1: Elimina tutti i generi attuali
    console.log("🗑️ Eliminazione generi attuali...");
    const deleteResult = await Genre.deleteMany({});
    console.log(`✅ Eliminati ${deleteResult.deletedCount} generi esistenti`);

    // Fase 2: Crea i generi originali
    console.log("➕ Creazione generi originali...");

    // Prepara i generi da inserire (usando solo i campi presenti nel modello)
    const genresToInsert = originalGenres.map((genre) => ({
      name: genre.title,
      totalArticles: 0,
      categoryCounts: [],
      topicCounts: [],
      authorCounts: [],
    }));

    // Inserisci i nuovi generi
    const insertedGenres = await Genre.insertMany(genresToInsert);
    console.log(`✅ Inseriti ${insertedGenres.length} generi originali`);

    // Ottieni i generi appena inseriti per la risposta
    const newGenres = await Genre.find().select("name _id").lean();

    return NextResponse.json(
      {
        success: true,
        message: "Generi ripristinati con successo",
        genres: newGenres,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("❌ Errore API /api/reset-genres (POST):", error.message);
    return NextResponse.json(
      { error: "Internal Server Error: " + error.message },
      { status: 500 },
    );
  }
}
