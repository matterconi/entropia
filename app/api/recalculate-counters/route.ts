import { NextRequest, NextResponse } from "next/server";

import Article from "@/database/Article";
import Category from "@/database/Category";
import Genre from "@/database/Genre";
import Topic from "@/database/Topic";
import dbConnect from "@/lib/mongoose";
import debugRecalculateCounters from "@/lib/recalculateCounters";

/**
 * GET - Verifica i dati del database
 * Restituisce informazioni dettagliate sulla struttura dei dati nel database
 */
export async function GET(req: NextRequest) {
  try {
    console.log(
      "🔍 API /api/all-models: Caricamento di tutti i dati dei modelli...",
    );
    await dbConnect();

    interface ModelItem {
      id: any;
      name: any;
      totalArticles: number;
      genreCounts: any[];
      topicCounts: any[];
      authorCounts: any[];
      createdAt: any;
      updatedAt: any;
      categoryCounts?: any[];
    }

    const result: {
      categories: ModelItem[];
      genres: ModelItem[];
      topics: ModelItem[];
    } = {
      categories: [],
      genres: [],
      topics: [],
    };

    // Carica tutte le categorie senza filtri
    const categories = await Category.find().lean();
    result.categories = categories.map((cat) => ({
      id: cat._id,
      name: cat.name,
      totalArticles: cat.totalArticles || 0,
      genreCounts: cat.genreCounts || [],
      topicCounts: cat.topicCounts || [],
      authorCounts: cat.authorCounts || [],
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    }));

    // Carica tutti i generi senza filtri
    const genres = await Genre.find().lean();
    result.genres = genres.map((genre) => ({
      id: genre._id,
      name: genre.name,
      totalArticles: genre.totalArticles || 0,
      categoryCounts: genre.categoryCounts || [],
      topicCounts: genre.topicCounts || [],
      authorCounts: genre.authorCounts || [],
      genreCounts: [], // Adding the required property
      createdAt: genre.createdAt,
      updatedAt: genre.updatedAt,
    }));

    // Carica tutti i topic senza filtri
    const topics = await Topic.find().lean();
    result.topics = topics.map((topic) => ({
      id: topic._id,
      name: topic.name,
      totalArticles: topic.totalArticles || 0,
      categoryCounts: topic.categoryCounts || [],
      genreCounts: topic.genreCounts || [],
      authorCounts: topic.authorCounts || [],
      topicCounts: [], // Adding the required property
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt,
    }));

    console.log("✅ Caricamento completato:");
    console.log(`- Categorie: ${result.categories.length}`);
    console.log(`- Generi: ${result.genres.length}`);
    console.log(`- Topic: ${result.topics.length}`);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("❌ Errore API /api/all-models (GET):", error.message);
    return NextResponse.json(
      { error: "Error loading models: " + error.message },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log(
      "🔄 API /api/debug-counters: Avvio ricalcolo contatori con diagnostica...",
    );

    // Esegui il ricalcolo dei contatori in modalità debug
    const result = await debugRecalculateCounters();

    if (result.success) {
      return NextResponse.json({ message: result.message }, { status: 200 });
    } else {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }
  } catch (error: any) {
    console.error("❌ Errore API /api/debug-counters (POST):", error.message);
    return NextResponse.json(
      { error: "Internal Server Error: " + error.message },
      { status: 500 },
    );
  }
}
