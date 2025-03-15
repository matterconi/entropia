import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

import Article from "@/database/Article";
import Topic from "@/database/Topic";
import dbConnect from "@/lib/mongoose";

// Nuovi topic da inserire (solo nome, senza campi aggiuntivi per ora)
const newTopics = [
  "Filosofia",
  "Esistenzialismo",
  "Cinema",
  "Musica",
  "Arte",
  "Politica",
  "Psicologia",
  "Società",
  "Storia",
  "Scienza",
  "Tecnologia",
  "Spiritualità",
  "Letteratura",
  "Cultura-Pop",
];

/**
 * POST - Resetta i topic nel database
 */
export async function POST(req: NextRequest) {
  console.log("🔄 API /api/reset-topics: Inizio reset topic...");
  await dbConnect();

  try {
    // Passaggio 1: Elimina tutti i topic esistenti
    console.log("🗑️ Eliminazione topic esistenti...");
    const deleteResult = await Topic.deleteMany({});
    console.log(`✅ Eliminati ${deleteResult.deletedCount} topic esistenti`);

    // Passaggio 2: Crea i nuovi topic
    console.log("➕ Creazione nuovi topic...");

    // Prepara i dati per l'inserimento seguendo lo schema esistente
    const topicsToInsert = newTopics.map((topicName) => ({
      name: topicName,
      totalArticles: 0,
      categoryCounts: [],
      genreCounts: [],
      authorCounts: [],
    }));

    const insertedTopics = await Topic.insertMany(topicsToInsert);
    console.log(`✅ Inseriti ${insertedTopics.length} nuovi topic`);

    // Passaggio 3: Aggiorna gli articoli che fanno riferimento ai vecchi topic
    console.log("🔄 Aggiornamento riferimenti negli articoli...");

    // Trova articoli con topic
    const articlesWithTopics = await Article.countDocuments({
      topics: { $exists: true, $ne: [] },
    });

    if (articlesWithTopics > 0) {
      // Reset dei riferimenti ai topic negli articoli
      const resetResult = await Article.updateMany(
        { topics: { $exists: true, $ne: [] } },
        { $set: { topics: [] } },
      );

      console.log(
        `ℹ️ Reset dei riferimenti ai topic in ${resetResult.modifiedCount} articoli`,
      );
    } else {
      console.log("ℹ️ Nessun articolo con riferimenti a topic da aggiornare");
    }

    // Passaggio 4: Ottieni la lista dei nuovi topic per la risposta
    const newTopicsList = await Topic.find().select("name _id").lean();

    return NextResponse.json(
      {
        success: true,
        message: `Reset completato. ${insertedTopics.length} nuovi topic creati.`,
        topics: newTopicsList,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("❌ Errore durante il reset dei topic:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Errore durante il reset dei topic",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

/**
 * GET - Ottieni tutti i topic
 */
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
      errorMessage = error.message;
    } else {
      console.error("❌ Errore nel recupero dei topic:", error);
    }

    return NextResponse.json(
      { message: "Errore nel recupero dei topic", error: errorMessage },
      { status: 500 },
    );
  }
}
