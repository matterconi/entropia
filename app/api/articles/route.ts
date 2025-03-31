import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

import Article from "@/database/Article";
import Category from "@/database/Category";
import Genre from "@/database/Genre";
import Series from "@/database/Serie"; // Add import for Series model
import Topic from "@/database/Topic";
import User from "@/database/User";
import dbConnect from "@/lib/mongoose";
import updateModelStats from "@/lib/updateModelStats";

// Inizializza OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Inizializza Supabase (assumo lo usi per i file markdown)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE!;
const supabase = createClient(supabaseUrl, supabaseKey);

// 📝 GET: Recupera tutti gli articoli
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Recupera gli articoli senza populate complesso
    const articles = await Article.find().sort({ createdAt: -1 }).lean();

    // Recupera tutti i generi, topic, categorie, utenti e serie per lookup manuale
    const allGenres = await Genre.find().lean();
    const allTopics = await Topic.find().lean();
    const allCategories = await Category.find().lean();
    const allUsers = await User.find().lean();
    const allSeries = await Series.find().lean(); // Aggiungi query per recuperare le serie

    // Crea mappe per lookup veloce
    const genreMap = new Map(
      allGenres.map((genre: any) => [genre._id.toString(), genre]),
    );
    const topicMap = new Map(
      allTopics.map((topic: any) => [topic._id.toString(), topic]),
    );
    const categoryMap = new Map(
      allCategories.map((category: any) => [category._id.toString(), category]),
    );
    const userMap = new Map(
      allUsers.map((user: any) => [user._id.toString(), user]),
    );
    // Crea una mappa per le serie
    const seriesMap = new Map(
      allSeries.map((series: any) => [series._id.toString(), series]),
    );

    // Funzione per convertire qualsiasi formato di ID in stringa
    // Define interfaces for possible ID formats
    interface ObjectWithId {
      _id: string | { toString(): string };
    }

    // Function to safely convert any ID format to string
    const safeId = (
      id: string | ObjectWithId | { toString(): string } | null | undefined,
    ): string | null => {
      if (!id) return null;
      if (typeof id === "object" && "_id" in id) return id._id.toString();
      return id.toString();
    };

    // Formatta gli articoli gestendo entrambi i formati (vecchio e nuovo)
    const formattedArticles = articles.map((article: any) => {
      // Gestisci author - ottieni dettagli completi dell'autore
      const authorId = safeId(article.author);
      const authorDetails = userMap.get(authorId);
      const formattedAuthor = authorId
        ? {
            id: authorId,
            username: authorDetails?.username || "Utente Sconosciuto",
            profileimg: authorDetails?.profileImg || null,
            bio: authorDetails?.bio || null,
          }
        : null;

      // Gestisci serie - se l'articolo appartiene a una serie
      let formattedSeries = null;
      if (article.series) {
        const seriesId = safeId(article.series);
        const seriesDetails = seriesMap.get(seriesId);

        if (seriesDetails) {
          formattedSeries = {
            _id: seriesId,
            title: seriesDetails.title || "Serie Sconosciuta",
            chapters: seriesDetails.chapters || [],
            totalChapters: seriesDetails.chapters?.length || 0,
          };
        }
      }

      // Gestisci categorie
      const safeCategories = (article.categories || []).map(
        (
          catId:
            | string
            | ObjectWithId
            | { toString(): string }
            | null
            | undefined,
        ) => {
          const id = safeId(catId);
          const category = categoryMap.get(id);
          return {
            id,
            name: category?.name || "Categoria Sconosciuta",
          };
        },
      );

      // Gestisci i generi - supporta sia il vecchio che il nuovo formato
      let safeGenres: { id: string | null; name: string; relevance: number }[] =
        [];
      if (Array.isArray(article.genres)) {
        safeGenres = article.genres.map((genre: any, index: number) => {
          // Gestione del nuovo formato {id, relevance}
          if (genre && typeof genre === "object" && genre.id) {
            const id = safeId(genre.id);
            const genreObj = genreMap.get(id);
            return {
              id,
              name: genreObj?.name || "Genere Sconosciuto",
              relevance: genre.relevance || index + 1,
            };
          }
          // Gestione del vecchio formato (solo ID)
          else {
            const id = safeId(genre);
            const genreObj = genreMap.get(id);
            return {
              id,
              name: genreObj?.name || "Genere Sconosciuto",
              relevance: index + 1, // Assegna relevance in base all'ordine
            };
          }
        });
      }

      // Gestisci i topic - supporta sia il vecchio che il nuovo formato
      let safeTopics: { id: string | null; name: any; relevance: any }[] = [];
      if (Array.isArray(article.topics)) {
        // Interface for topic objects in the new format
        interface TopicWithRelevance {
          id: string | { toString(): string };
          relevance?: number;
        }

        // Interface for formatted topic objects to be returned
        interface FormattedTopic {
          id: string | null;
          name: string;
          relevance: number;
        }

        safeTopics = article.topics.map(
          (
            topic:
              | string
              | TopicWithRelevance
              | { toString(): string }
              | null
              | undefined,
            index: number,
          ): FormattedTopic => {
            // Gestione del nuovo formato {id, relevance}
            if (topic && typeof topic === "object" && "id" in topic) {
              const id = safeId(topic.id);
              const topicObj = topicMap.get(id);
              return {
                id,
                name: topicObj?.name || "Topic Sconosciuto",
                relevance: (topic as TopicWithRelevance).relevance || index + 1,
              };
            }
            // Gestione del vecchio formato (solo ID)
            else {
              const id = safeId(topic);
              const topicObj = topicMap.get(id);
              return {
                id,
                name: topicObj?.name || "Topic Sconosciuto",
                relevance: index + 1, // Assegna relevance in base all'ordine
              };
            }
          },
        );
      }

      // Restituisci l'articolo formattato
      return {
        ...article,
        _id: article._id.toString(),
        author: formattedAuthor, // Usa l'autore formattato completo invece del solo ID
        series: formattedSeries, // Aggiungi la serie formattata
        categories: safeCategories,
        genres: safeGenres,
        topics: safeTopics,
      };
    });

    return NextResponse.json(formattedArticles, { status: 200 });
  } catch (error: any) {
    console.error("❌ Errore API /api/articles (GET):", error.message);
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();

    // Estrai le opzioni dal body o dalla query
    const bodyText = await req.text();
    let options = {};

    try {
      if (bodyText) {
        options = JSON.parse(bodyText);
      } else {
        // Se non c'è body, controlla i parametri di query
        const url = new URL(req.url);
        const all = url.searchParams.get("all") === "true";
        const articles = url.searchParams.get("articles") === "true";
        const topics = url.searchParams.get("topics") === "true";
        const categories = url.searchParams.get("categories") === "true";
        const genres = url.searchParams.get("genres") === "true";
        const authors = url.searchParams.get("authors") === "true";
        const series = url.searchParams.get("series") === "true";
        const comments = url.searchParams.get("comments") === "true";

        options = {
          all,
          articles,
          topics,
          categories,
          genres,
          authors,
          series,
          comments,
        };
      }
    } catch (error) {
      console.error("Errore nel parsing delle opzioni:", error);
      return NextResponse.json(
        { error: "Formato del body non valido" },
        { status: 400 },
      );
    }

    const deleteAll = options.all || false;
    const results = {};

    // Elimina gli articoli se richiesto
    if (deleteAll || options.articles) {
      const articleResult = await Article.deleteMany({});
      results.articles = {
        deleted: articleResult.deletedCount,
        success: true,
      };
      console.log(`✅ Eliminati ${articleResult.deletedCount} articoli`);
    }

    // Elimina i topic se richiesto
    if (deleteAll || options.topics) {
      const topicResult = await Topic.deleteMany({});
      results.topics = {
        deleted: topicResult.deletedCount,
        success: true,
      };
      console.log(`✅ Eliminati ${topicResult.deletedCount} topic`);
    }

    // Elimina le categorie se richiesto
    if (deleteAll || options.categories) {
      const categoryResult = await Category.deleteMany({});
      results.categories = {
        deleted: categoryResult.deletedCount,
        success: true,
      };
      console.log(`✅ Eliminate ${categoryResult.deletedCount} categorie`);
    }

    // Elimina i generi se richiesto
    if (deleteAll || options.genres) {
      const genreResult = await Genre.deleteMany({});
      results.genres = {
        deleted: genreResult.deletedCount,
        success: true,
      };
      console.log(`✅ Eliminati ${genreResult.deletedCount} generi`);
    }

    // Elimina le serie se richiesto
    if (deleteAll || options.series) {
      const seriesResult = await Series.deleteMany({});
      results.series = {
        deleted: seriesResult.deletedCount,
        success: true,
      };
      console.log(`✅ Eliminate ${seriesResult.deletedCount} serie`);
    }

    // Se non è stata specificata alcuna opzione valida
    if (Object.keys(results).length === 0 && !deleteAll) {
      console.log("❌ Nessuna collezione specificata per l'eliminazione");
      return NextResponse.json(
        { error: "Nessuna collezione specificata per l'eliminazione" },
        { status: 400 },
      );
    }

    console.log("✅ Database pulito con successo");
    return NextResponse.json(
      {
        success: true,
        message: "Database pulito con successo",
        details: results,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("❌ Errore API /api/clean-database (DELETE):", error.message);
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
