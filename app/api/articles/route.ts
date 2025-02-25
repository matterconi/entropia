import { NextRequest, NextResponse } from "next/server";

import Article from "@/database/Article";
import Category from "@/database/Category";
import Genre from "@/database/Genre";
import Topic from "@/database/Topic";
import dbConnect from "@/lib/mongoose";

// 📝 GET: Recupera tutti gli articoli
export async function GET(req: NextRequest) {
  try {
    console.log("🔹 API /api/articles: Recupero degli articoli...");
    await dbConnect();

    // ✅ Recupera tutti gli articoli ordinati per data di creazione e li converte in JSON-friendly objects
    const articles = await Article.find()
      .populate("categories", "name")
      .populate("genres", "name")
      .populate("topics", "name")
      .sort({ createdAt: -1 })
      .lean(); // 🔄 Converte gli oggetti Mongoose in oggetti JS normali

    console.log(`✅ ${articles.length} articoli trovati.`);
    return NextResponse.json(articles, { status: 200 });
  } catch (error: any) {
    console.error("❌ Errore API /api/articles (GET):", error.message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// 📝 POST: Crea un nuovo articolo
export async function POST(req: NextRequest) {
  try {
    console.log("🔹 API /api/articles: Connessione al database...");
    await dbConnect();

    // ✅ Legge i dati in JSON
    const {
      title,
      coverImage,
      markdownPath,
      author,
      categories,
      genres,
      topics,
    } = await req.json();

    console.log("📩 Dati ricevuti:", {
      title,
      coverImage,
      markdownPath,
      author,
      categories,
      genres,
      topics,
    });

    // ✅ Verifica che tutti i campi richiesti siano presenti
    if (!title || !coverImage || !markdownPath || !author) {
      console.error("❌ Errore: Dati mancanti!");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // ✅ Converti i nomi delle categorie, generi e topic in ObjectId
    const categoryIds = await Category.find({
      name: { $in: categories },
    }).select("_id");

    const genreIds = await Genre.find({
      name: { $in: genres },
    }).select("_id");

    const topicIds = await Topic.find({
      name: { $in: topics },
    }).select("_id");

    console.log("🔹 ID trovati:", {
      categoryIds,
      genreIds,
      topicIds,
    });

    // ✅ Crea un nuovo articolo con gli ID
    const newArticle = await Article.create({
      title,
      coverImage,
      markdownPath, // 🔗 Salva il percorso del file invece del contenuto
      author,
      categories: categoryIds.map((cat) => cat._id), // Array di ObjectId
      genres: genreIds.map((gen) => gen._id),
      topics: topicIds.map((top) => top._id),
    });

    console.log("✅ Articolo salvato con successo:", newArticle);

    return NextResponse.json(
      { message: "Article created", article: newArticle },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("❌ Errore API /api/articles (POST):", error.message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
