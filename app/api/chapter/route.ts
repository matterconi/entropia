import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

import Article from "@/database/Article";
import Category from "@/database/Category";
import Genre from "@/database/Genre";
import Serie from "@/database/Serie";
import Topic from "@/database/Topic";
import dbConnect from "@/lib/mongoose";

export async function POST(req: NextRequest) {
  try {
    console.log("🔹 API /api/chapters: Connessione al database...");
    await dbConnect();

    // ✅ Legge i dati in JSON
    const {
      serieId,
      title, // Titolo del capitolo
      markdownPath, // Percorso del file markdown
      coverImage, // Immagine di copertina (opzionale)
      author, // ID dell'autore
      chapterIndex, // Indice del capitolo (opzionale)
      categories, // Categorie (opzionale)
      genres, // Generi (opzionale)
      topics, // Topics (opzionale)
    } = await req.json();

    console.log("📩 Dati ricevuti:", {
      serieId,
      title,
      markdownPath,
      author,
    });

    // ✅ Verifica che tutti i campi richiesti siano presenti
    if (!serieId || !title || !markdownPath || !author) {
      console.error("❌ Errore: Dati mancanti!");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // ✅ Verifica che la serie esista
    const series = await Serie.findById(serieId);
    if (!series) {
      console.error("❌ Errore: Serie non trovata!");
      return NextResponse.json({ error: "Series not found" }, { status: 404 });
    }

    // ✅ Converti i nomi delle categorie, generi e topic in ObjectId (se presenti)
    const categoryIds = categories?.length
      ? await Category.find({ name: { $in: categories } }).select("_id")
      : [];

    const genreIds = genres?.length
      ? await Genre.find({ name: { $in: genres } }).select("_id")
      : [];

    const topicIds = topics?.length
      ? await Topic.find({ name: { $in: topics } }).select("_id")
      : [];

    console.log("🔹 ID trovati:", {
      categoryIds,
      genreIds,
      topicIds,
    });

    // Calcola l'indice del capitolo se non fornito
    const calculatedChapterIndex = chapterIndex || series.totalChapters + 1;

    // Inizia una sessione per una transazione
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // ✅ Crea un nuovo articolo come capitolo della serie
      const newChapter = await Article.create(
        [
          {
            title, // Titolo del capitolo
            coverImage: coverImage || "", // Immagine di copertina opzionale
            markdownPath, // Percorso del file markdown
            author, // ID dell'autore
            series: serieId, // Riferimento alla serie
            isSeriesChapter: true, // Indica che è un capitolo di una serie
            chapterTitle: title, // Titolo del capitolo
            chapterIndex: calculatedChapterIndex, // Indice del capitolo
            categories: categoryIds.map((cat) => cat._id),
            genres: genreIds.map((gen) => gen._id),
            topics: topicIds.map((top) => top._id),
          },
        ],
        { session },
      );

      // ✅ Aggiorna la serie con il riferimento al nuovo capitolo
      await Serie.findByIdAndUpdate(
        serieId,
        {
          $push: { chapters: newChapter[0]._id },
          $inc: { totalChapters: 1 },
        },
        { session },
      );

      // Conferma la transazione
      await session.commitTransaction();

      console.log("✅ Capitolo salvato con successo:", {
        chapter: newChapter[0],
      });

      return NextResponse.json(
        {
          message: "Chapter created successfully",
          chapter: newChapter[0],
        },
        { status: 201 },
      );
    } catch (transactionError) {
      // Annulla la transazione in caso di errore
      await session.abortTransaction();
      throw transactionError;
    } finally {
      // Termina la sessione
      session.endSession();
    }
  } catch (error: any) {
    console.error("❌ Errore API /api/chapters (POST):", error.message);

    // Gestione di errori di validazione specifici di Mongoose
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { error: "Validation Error", details: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
