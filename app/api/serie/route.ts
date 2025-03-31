import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

import Article from "@/database/Article";
import Category from "@/database/Category";
import Genre from "@/database/Genre";
import Series from "@/database/Serie";
import Topic from "@/database/Topic";
import dbConnect from "@/lib/mongoose";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const authorId = searchParams.get("authorId");

    console.log("authorId ricevuto:", authorId);

    if (!authorId) {
      return NextResponse.json(
        {
          success: false,
          message: "authorId is required",
        },
        { status: 400 },
      );
    }

    // Recupera tutte le serie dell'autore specificato
    const authorSeries = await Series.find({ author: authorId })
      .select("_id title description isComplete totalChapters")
      .sort({ createdAt: -1 }); // Ordina per data di creazione (più recenti prima)

    console.log("Serie trovate:", authorSeries.length);

    // Trasforma i dati per adattarli al formato atteso dal frontend
    const formattedSeries = authorSeries.map((series) => ({
      id: series._id.toString(),
      title: series.title,
      description: series.description,
      isComplete: series.isComplete,
      totalChapters: series.totalChapters,
    }));

    return NextResponse.json(formattedSeries, { status: 200 });
  } catch (error) {
    console.error("Errore durante il recupero delle serie:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Errore del server",
        error: (error as Error).message,
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("🔹 API /api/series: Connessione al database...");
    await dbConnect();

    // ✅ Legge i dati in JSON
    const {
      title,
      author,

      // Article details
      articleTitle,
      articleCoverImage,
      articleMarkdownPath,
      articleCategories,
      articleGenres,
      articleTopics,

      // Optional
      subtitle,
      chapterIndex = 1,
      isComplete = false,
    } = await req.json();

    console.log("📩 Dati ricevuti:", {
      title,
      author,
      articleTitle,
      articleCoverImage,
      articleMarkdownPath,
    });

    // ✅ Verifica che tutti i campi richiesti siano presenti
    if (
      !title ||
      !author ||
      !articleTitle ||
      !articleCoverImage ||
      !articleMarkdownPath
    ) {
      console.error("❌ Errore: Dati mancanti!");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // ✅ Converti i nomi delle categorie, generi e topic in ObjectId
    const categoryIds = await Category.find({
      name: { $in: articleCategories || [] },
    }).select("_id");

    const genreIds = await Genre.find({
      name: { $in: articleGenres || [] },
    }).select("_id");

    const topicIds = await Topic.find({
      name: { $in: articleTopics || [] },
    }).select("_id");

    console.log("🔹 ID trovati:", {
      categoryIds,
      genreIds,
      topicIds,
    });

    // Inizia una sessione per una transazione
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // ✅ Crea una nuova serie
      const newSeries = await Series.create(
        [
          {
            title,
            author,
            isComplete,
            totalChapters: 1,
            chapters: [], // Verrà popolato dopo la creazione dell'articolo
          },
        ],
        { session },
      );

      // ✅ Crea un nuovo articolo collegato alla serie
      const newArticle = await Article.create(
        [
          {
            title: articleTitle,
            coverImage: articleCoverImage,
            markdownPath: articleMarkdownPath,
            author,
            series: newSeries[0]._id,
            isSeriesChapter: true,
            chapterTitle: subtitle || articleTitle,
            chapterIndex,
            categories: categoryIds.map((cat) => cat._id),
            genres: genreIds.map((gen) => gen._id),
            topics: topicIds.map((top) => top._id),
          },
        ],
        { session },
      );

      // ✅ Aggiorna la serie con il riferimento al capitolo
      await Series.findByIdAndUpdate(
        newSeries[0]._id,
        { $push: { chapters: newArticle[0]._id } },
        { session },
      );

      // Conferma la transazione
      await session.commitTransaction();

      console.log("✅ Serie e articolo salvati con successo:", {
        series: newSeries[0],
        article: newArticle[0],
      });

      return NextResponse.json(
        {
          message: "Series and first chapter created",
          series: newSeries[0],
          article: newArticle[0],
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
    console.error("❌ Errore API /api/series (POST):", error.message);

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

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get("articleId");

    const body = await request.json();
    const { seriesId, chapterTitle, chapterIndex } = body;

    if (!articleId || !seriesId) {
      return NextResponse.json(
        {
          success: false,
          message: "articleId e seriesId sono obbligatori",
        },
        { status: 400 },
      );
    }

    // Verifica se l'articolo esiste
    const article = await Article.findById(articleId);
    if (!article) {
      return NextResponse.json(
        {
          success: false,
          message: "Articolo non trovato",
        },
        { status: 404 },
      );
    }

    // Verifica se la serie esiste
    const series = await Series.findById(seriesId);
    if (!series) {
      return NextResponse.json(
        {
          success: false,
          message: "Serie non trovata",
        },
        { status: 404 },
      );
    }

    // Controlla che l'autore dell'articolo sia anche proprietario della serie
    if (article.author.toString() !== series.author.toString()) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Non hai i permessi per collegare questo articolo a questa serie",
        },
        { status: 403 },
      );
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Calcola l'indice del capitolo se non è stato fornito
      let finalChapterIndex = chapterIndex;
      if (finalChapterIndex === undefined) {
        // Se non è specificato, assegna come ultimo capitolo
        finalChapterIndex = series.totalChapters;
      }

      // Aggiorna l'articolo con le informazioni della serie
      await Article.findByIdAndUpdate(
        articleId,
        {
          series: seriesId,
          isSeriesChapter: true,
          chapterTitle: chapterTitle || article.title,
          chapterIndex: finalChapterIndex,
        },
        { session },
      );

      // Aggiungi il riferimento dell'articolo alla serie (se non è già presente)
      if (!series.chapters.includes(article._id)) {
        await Series.findByIdAndUpdate(
          seriesId,
          {
            $addToSet: { chapters: article._id },
            $inc: { totalChapters: 1 },
          },
          { session },
        );
      }

      await session.commitTransaction();

      return NextResponse.json(
        {
          success: true,
          message: "Articolo collegato alla serie con successo",
        },
        { status: 200 },
      );
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Errore durante l'aggiornamento dell'articolo:", error);

    // Gestione errore di validazione Mongoose
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        {
          success: false,
          message: (error as Error).message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Errore del server",
      },
      { status: 500 },
    );
  }
}

// Opzionale: gestisci altri metodi HTTP non supportati
export function HEAD() {
  return NextResponse.json(
    {
      success: false,
      message: "Metodo non consentito",
    },
    { status: 405 },
  );
}

export function OPTIONS() {
  return NextResponse.json(
    {
      success: false,
      message: "Metodo non consentito",
    },
    { status: 405 },
  );
}
