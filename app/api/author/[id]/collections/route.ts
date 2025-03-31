import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import Article from "@/database/Article";
import Series from "@/database/Serie";
import User from "@/database/User";
import {
  analyzeContentWithAI,
  rearrangeByAIPreference,
} from "@/lib/aiContentAnalysis";
import dbConnect from "@/lib/mongoose";
import { findTagIds, processContentTags } from "@/lib/tagProcessing";
import updateModelStats from "@/lib/updateModelStats";

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
      .select(
        "_id title description isComplete totalChapters coverImage createdAt updatedAt",
      )
      .sort({ createdAt: -1 }); // Ordina per data di creazione (più recenti prima)

    console.log("Serie trovate:", authorSeries.length);

    // Trasforma i dati per adattarli al formato atteso dal frontend
    const formattedSeries = authorSeries.map((series) => ({
      id: series._id.toString(),
      title: series.title,
      description: series.description,
      isComplete: series.isComplete,
      totalChapters: series.totalChapters,
      coverImage: series.coverImage,
      createdAt: series.createdAt,
      updatedAt: series.updatedAt,
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

/**
 * Crea una nuova serie con il primo capitolo
 */
export async function POST(req: NextRequest) {
  try {
    console.log("🔹 API /api/series: Connessione al database...");
    await dbConnect();

    // To this (rename it to authSession):
    const authSession = await auth();

    // And update all references:
    if (!authSession || !authSession.user) {
      console.error("❌ Errore: Utente non autenticato");
      return NextResponse.json(
        { error: "Unauthorized: Authentication required" },
        { status: 401 },
      );
    }

    // Ottieni l'ID utente autenticato dalla sessione
    const authenticatedUserId = authSession.user.id;

    // ✅ Legge i dati in JSON
    const {
      // Serie details
      title,
      description,
      coverImage,
      isComplete = false,

      // First chapter details
      chapterTitle,
      chapterCoverImage,
      chapterMarkdownPath,
      chapterMarkdownContent,
      chapterCategories = [],
      chapterGenres = [],
      chapterTopics = [],

      // Optional settings
      performAIAnalysis = true,
      allowNewTags = true,
    } = await req.json();

    console.log("📩 Dati ricevuti per la serie (completi):", {
      title,
      description,
      coverImage,
      isComplete,
      chapterTitle,
      chapterCoverImage,
      chapterMarkdownPath,
      chapterMarkdownContent,
      chapterCategories,
      chapterGenres,
      chapterTopics,
      performAIAnalysis,
      allowNewTags,
    });

    // ✅ Verifica che tutti i campi richiesti siano presenti
    if (!title || !chapterTitle || !chapterCoverImage || !chapterMarkdownPath) {
      console.error("❌ Errore: Dati mancanti!");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Verificare che l'utente autenticato abbia i permessi per creare serie
    const userDoc = await User.findById(authenticatedUserId);
    if (
      !userDoc ||
      !userDoc.role ||
      (userDoc.role !== "author" &&
        userDoc.role !== "admin" &&
        userDoc.role !== "editor")
    ) {
      console.error("❌ Errore: Utente non ha i permessi necessari", {
        role: userDoc?.role || "non trovato",
      });
      return NextResponse.json(
        {
          error: "Forbidden: User does not have permission to create series",
        },
        { status: 403 },
      );
    }

    // Variabili per i risultati dell'analisi AI
    let aiAnalysisResults = null;
    let processedGenres = chapterGenres;
    let processedTopics = chapterTopics;
    let aiDescription = null;

    // Normalizza le categorie: se è una stringa, convertila in array
    let normalizedCategories = chapterCategories;
    if (typeof chapterCategories === "string") {
      // Se è una stringa non vuota, la mettiamo in un array
      if (chapterCategories.trim()) {
        normalizedCategories = [chapterCategories.trim()];
      } else {
        // Se è una stringa vuota, usiamo un array vuoto
        normalizedCategories = [];
      }
      console.log(
        "🔄 Convertita categoria da stringa ad array:",
        normalizedCategories,
      );
    }

    // Normalizza i generi: se è una stringa, convertila in array
    if (typeof chapterGenres === "string") {
      if (chapterGenres.trim()) {
        processedGenres = [chapterGenres.trim()];
      } else {
        processedGenres = [];
      }
      console.log("🔄 Convertiti generi da stringa ad array:", processedGenres);
    }

    // Normalizza i topics: se è una stringa, convertila in array
    if (typeof chapterTopics === "string") {
      if (chapterTopics.trim()) {
        processedTopics = [chapterTopics.trim()];
      } else {
        processedTopics = [];
      }
      console.log("🔄 Convertiti topics da stringa ad array:", processedTopics);
    }

    // Se è richiesta l'analisi AI, ottieni il testo del markdown e esegui l'analisi
    if (performAIAnalysis) {
      try {
        console.log("🧠 Inizia analisi AI del contenuto...");
        aiAnalysisResults = await analyzeContentWithAI({
          title: chapterTitle,
          markdownPath: chapterMarkdownPath,
          markdownContent: chapterMarkdownContent,
          initialGenres: processedGenres,
          initialTopics: processedTopics,
          allowNewTags,
        });

        console.log("✅ Analisi AI completata");
        aiDescription = aiAnalysisResults.description;

        // Usa i generi e topic dall'AI se non sono stati forniti dall'utente o riordinali
        if (Array.isArray(processedGenres) && processedGenres.length === 0) {
          processedGenres = aiAnalysisResults.generi;
        } else if (Array.isArray(processedGenres)) {
          // Riordina i generi esistenti in base all'analisi AI
          processedGenres = rearrangeByAIPreference(
            processedGenres,
            aiAnalysisResults.generi,
          );
        }

        if (Array.isArray(processedTopics) && processedTopics.length === 0) {
          processedTopics = aiAnalysisResults.topics;
        } else if (Array.isArray(processedTopics)) {
          // Riordina i topic esistenti in base all'analisi AI
          processedTopics = rearrangeByAIPreference(
            processedTopics,
            aiAnalysisResults.topics,
          );
        }

        console.log("🔹 Tag dopo analisi AI:", {
          categories: normalizedCategories,
          genres: processedGenres,
          topics: processedTopics,
        });
      } catch (aiError) {
        console.error("❌ Errore durante l'analisi AI:", aiError);
        // Continuiamo anche se l'analisi AI fallisce
      }
    }

    // Processa i tag
    const tagResult = await processContentTags(
      normalizedCategories,
      processedGenres,
      processedTopics,
    );

    // Inizia una sessione per una transazione
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // ✅ Crea una nuova serie
      const newSeries = await Series.create(
        [
          {
            title,
            description,
            coverImage,
            author: authenticatedUserId,
            isComplete,
            totalChapters: 1,
            chapters: [], // Verrà popolato dopo la creazione dell'articolo
            aiDescription: aiDescription, // Se abbiamo una descrizione AI, usala anche per la serie
            embedding: aiAnalysisResults?.embedding, // Se abbiamo un embedding AI, usalo anche per la serie
          },
        ],
        { session },
      );

      // ✅ Crea un nuovo articolo collegato alla serie
      const newArticle = await Article.create(
        [
          {
            title: chapterTitle,
            coverImage: chapterCoverImage,
            markdownPath: chapterMarkdownPath,
            author: authenticatedUserId,
            series: newSeries[0]._id,
            isSeriesChapter: true,
            chapterTitle: chapterTitle,
            chapterIndex: 1, // Primo capitolo
            categories: tagResult.categoryIds,
            genres: tagResult.genresWithRelevance,
            topics: tagResult.topicsWithRelevance,
            aiDescription: aiDescription,
            embedding: aiAnalysisResults?.embedding,
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

      console.log("✅ Serie e primo capitolo salvati con successo:", {
        series: newSeries[0]._id,
        article: newArticle[0]._id,
      });

      // Aggiorna le statistiche del modello per il nuovo articolo
      try {
        console.log("🔄 Avvio aggiornamento statistiche...");
        const statsResult = await updateModelStats(newArticle[0]._id);
        console.log("✅ Aggiornamento statistiche completato:", statsResult);
      } catch (statsError) {
        console.error(
          "⚠️ Errore nell'aggiornamento delle statistiche:",
          statsError,
        );
        // Continuiamo comunque anche se l'aggiornamento delle statistiche fallisce
      }

      return NextResponse.json(
        {
          message: "Series and first chapter created",
          series: newSeries[0],
          article: newArticle[0],
          newTagsCreated: aiAnalysisResults?.newTagsCreated || {
            genres: [],
            topics: [],
          },
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

    // Verifica che l'utente sia autenticato tramite NextAuth
    const authResult = await auth();
    if (!authResult || !authResult.user || !authResult.user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Autenticazione richiesta",
        },
        { status: 401 },
      );
    }

    const authenticatedUserId = authResult.user.id;

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

    // Controlla che l'utente autenticato sia l'autore dell'articolo o un admin
    if (article.author.toString() !== authenticatedUserId) {
      const user = await User.findById(authenticatedUserId);
      if (!user || user.role !== "admin") {
        return NextResponse.json(
          {
            success: false,
            message: "Non hai i permessi per modificare questo articolo",
          },
          { status: 403 },
        );
      }
    }

    // Controlla che l'autore dell'articolo sia anche proprietario della serie o un admin
    if (article.author.toString() !== series.author.toString()) {
      const user = await User.findById(authenticatedUserId);
      if (!user || user.role !== "admin") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Non hai i permessi per collegare questo articolo a questa serie",
          },
          { status: 403 },
        );
      }
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Calcola l'indice del capitolo se non è stato fornito
      let finalChapterIndex = chapterIndex;
      if (finalChapterIndex === undefined) {
        // Se non è specificato, assegna come ultimo capitolo
        finalChapterIndex = series.totalChapters + 1;
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
