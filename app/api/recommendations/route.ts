// File: app/api/recommendations/route.ts
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

import Article from "@/database/Article";
import Series from "@/database/Serie"; // Assicurati che il percorso sia corretto
import connectDB from "@/lib/mongoose";
// Importa il modello Serie

/**
 * Funzione ottimizzata per findSimilarArticles
 * Focalizzata esclusivamente sulla ricerca vettoriale senza fallback
 *
 * @param embedding Il vettore di embedding dell'articolo di origine
 * @param limit Il numero massimo di articoli da restituire
 * @param excludeIds Array di ID di articoli da escludere dai risultati
 * @returns Array di articoli con punteggi di similarità
 */
async function findSimilarArticles(
  embedding: number[],
  limit: number,
  excludeIds: mongoose.Types.ObjectId[] = [],
): Promise<any[]> {
  // Log per debug
  console.log(
    `[Recommendations] Ricerca articoli simili per: ${excludeIds[0]?.toString()}`,
  );

  try {
    if (!embedding || embedding.length === 0) {
      console.log("[Recommendations] Errore: embedding non valido");
      return [];
    }

    console.log(
      `[Recommendations] Tentativo di ricerca vettoriale con embedding di ${embedding.length} dimensioni`,
    );

    // Ricerca vettoriale pura (nessun fallback)
    const vectorResults = await Article.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: embedding,
          numCandidates: limit * 3, // Aumentato per migliorare la qualità dei risultati
          limit: limit * 1.5, // Buffer aggiuntivo per il filtro
        },
      },
      {
        $match: {
          _id: { $nin: excludeIds },
          // TEMP: Commentiamo per debug - riattivare in produzione
          // isPublished: true,
        },
      },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          title: 1,
          coverImage: 1,
          author: 1,
          publicationDate: 1,
          categories: 1,
          genres: 1,
          topics: 1,
          isSeriesChapter: 1,
          series: 1,
          similarity: { $meta: "vectorSearchScore" },
        },
      },
    ]).allowDiskUse(true);

    if (vectorResults && vectorResults.length > 0) {
      console.log(
        `[Recommendations] Ricerca vettoriale riuscita: ${vectorResults.length} risultati`,
      );
      return vectorResults.map((article) => ({
        ...article,
        isVectorSearch: true,
      }));
    }

    console.log("[Recommendations] Ricerca vettoriale non ha dato risultati");
    return [];
  } catch (error) {
    console.error("[Recommendations] Errore nella ricerca vettoriale:", error);
    throw error; // Propaga l'errore per mostrare chiaramente il problema
  }
}

// Tipo per la risposta
interface RecommendationResponse {
  articles: any[];
  message?: string;
  method?: string;
}

/**
 * Utility per semplificare la struttura di elementi come generi e topics
 * per il frontend
 */
function simplifyItems(items: any[]) {
  if (!Array.isArray(items)) return [];

  return items
    .filter((item) => item && (item.id || item._id))
    .map((item) => {
      if (item.id && typeof item.id === "object") {
        return item.id;
      }
      return item;
    });
}

/**
 * GET /api/recommendations?articleId=xyz
 * Ritorna gli articoli consigliati utilizzando esclusivamente la ricerca vettoriale
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<RecommendationResponse>> {
  try {
    // Connetti al database
    await connectDB();

    // Assicuriamoci che il modello Series sia registrato
    // Questo non fa nulla se il modello è già registrato, ma è un'ulteriore misura di sicurezza
    if (!mongoose.models.Series) {
      // Se il modello Serie non è stato ancora registrato, questo import lo registrerà
      require("@/database/Serie");
    }

    // Ottieni l'ID dell'articolo dalla query
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get("articleId");
    const limit = parseInt(searchParams.get("limit") || "8", 10);

    if (!articleId) {
      return NextResponse.json(
        { articles: [], message: "articleId query parameter is required" },
        { status: 400 },
      );
    }

    // Controlla se l'ID è valido
    if (!mongoose.Types.ObjectId.isValid(articleId)) {
      return NextResponse.json(
        { articles: [], message: "Invalid articleId format" },
        { status: 400 },
      );
    }

    // Trova l'articolo corrente
    const currentArticle =
      await Article.findById(articleId).select("embedding");

    if (!currentArticle) {
      return NextResponse.json(
        { articles: [], message: "Article not found" },
        { status: 404 },
      );
    }

    if (!currentArticle.embedding || currentArticle.embedding.length === 0) {
      return NextResponse.json(
        { articles: [], message: "Current article has no embedding" },
        { status: 404 },
      );
    }

    // Cerca articoli simili utilizzando SOLO ricerca vettoriale
    const recommendedArticles = await findSimilarArticles(
      currentArticle.embedding,
      limit,
      [new mongoose.Types.ObjectId(articleId)],
    );

    if (recommendedArticles.length === 0) {
      return NextResponse.json({
        articles: [],
        method: "vector",
        message: "No similar articles found",
      });
    }

    // Ottieni gli IDs di tutti gli articoli consigliati
    const articlesToPopulate = recommendedArticles.map(
      (article) => article._id,
    );

    // Ottieni un map della similarità per ogni articolo
    const similarityMap = new Map();
    recommendedArticles.forEach((article) => {
      similarityMap.set(article._id.toString(), article.similarity);
    });

    try {
      // Recupera gli articoli con i riferimenti popolati
      const populatedArticles = await Article.find({
        _id: { $in: articlesToPopulate },
      })
        .select(
          "_id title coverImage author publicationDate categories genres topics isSeriesChapter series aiDescription",
        )
        .populate("author", "username _id profileImg bio")
        .populate("categories", "_id name")
        .populate("genres.id", "_id name")
        .populate("topics.id", "_id name")
        .populate({
          path: "series",
          select: "_id title totalChapters chapters",
          model: "Series", // Specifica esplicitamente il nome del modello
        });

      // Crea un map degli articoli popolati
      const populatedMap = new Map();
      populatedArticles.forEach((article) => {
        populatedMap.set(
          article._id.toString(),
          article.toObject ? article.toObject() : article,
        );
      });

      // Crea l'array finale di risultati
      const finalResults = recommendedArticles.map((article) => {
        const populatedArticle = populatedMap.get(article._id.toString());

        if (populatedArticle) {
          // Mantieni il valore di similarità
          populatedArticle.similarity = similarityMap.get(
            article._id.toString(),
          );

          // Imposta il metodo utilizzato (sempre vector in questo caso)
          populatedArticle.recommendationMethod = "vector";

          // Semplifica la struttura dei generi per il frontend
          if (
            populatedArticle.genres &&
            Array.isArray(populatedArticle.genres)
          ) {
            populatedArticle.genres = simplifyItems(populatedArticle.genres);
          }

          // Semplifica la struttura dei topic per il frontend
          if (
            populatedArticle.topics &&
            Array.isArray(populatedArticle.topics)
          ) {
            populatedArticle.topics = simplifyItems(populatedArticle.topics);
          }

          return populatedArticle;
        }

        // Fallback all'articolo originale se non riusciamo a popolare
        article.recommendationMethod = "vector";
        return article;
      });

      return NextResponse.json({
        articles: finalResults,
        method: "vector",
      });
    } catch (error) {
      console.error("Error populating articles:", error);
      // Ritorna i risultati non popolati in caso di errore
      const simpleResults = recommendedArticles.map((article) => ({
        ...article,
        recommendationMethod: "vector",
        error: "Population failed",
      }));

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return NextResponse.json({
        articles: simpleResults,
        method: "vector",
        message: `Population error: ${errorMessage}`,
      });
    }
  } catch (error) {
    console.error("Error fetching recommended articles:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        articles: [],
        message: `Vector search error: ${errorMessage}`,
        method: "vector",
      },
      { status: 500 },
    );
  }
}
