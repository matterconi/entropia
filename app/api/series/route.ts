// api/series/route.ts
import { NextRequest, NextResponse } from "next/server";

import Article from "@/database/Article"; // Modello Article
import Author from "@/database/Author"; // Modello Author
import Serie from "@/database/Serie"; // Modello Serie
import User from "@/database/User"; // Aggiungiamo il modello User
import dbConnect from "@/lib/mongoose";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Ottieni i parametri dalla query
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const page = parseInt(url.searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    // Opzioni di filtro
    const authorId = url.searchParams.get("author");
    const isComplete = url.searchParams.get("isComplete");

    // Costruisci la query
    const query: any = {};

    if (authorId) {
      query.author = authorId;
    }

    if (isComplete !== null) {
      query.isComplete = isComplete === "true";
    }

    // Fetch delle serie
    const series = await Serie.find(query)
      .populate({
        path: "chapters",
        model: Article,
        select:
          "title slug coverImage excerpt category topics genres createdAt readingTime aiDescription author",
        options: { sort: { chapterIndex: 1 }, limit: 1 }, // Recupera solo il primo capitolo, ordinato per indice
        populate: [
          {
            path: "author",
            model: User, // Cambiamo da Author a User perché l'autore è un User
            select: "username profileImg bio _id",
          },
          {
            path: "topics.id",
            model: "Topic",
            select: "name slug",
          },
          {
            path: "genres.id",
            model: "Genre",
            select: "name slug",
          },
          {
            path: "categories",
            model: "Category",
            select: "name slug",
          },
        ],
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Conta il totale per la paginazione
    const total = await Serie.countDocuments(query);

    // Arricchisci i dati delle serie quando necessario
    const enrichedSeries = series.map((serie) => {
      // Se la serie non ha capitoli, restituisci i dati di base
      if (!serie.chapters || serie.chapters.length === 0) {
        return {
          ...serie,
          coverImage: serie.coverImage || "/images/default-series-cover.jpg",
          description: serie.description || "Serie in corso...",
          aiDescription: serie.aiDescription || "",
          author: null,
          topics: [],
          genres: [],
          categories: [],
          firstContentUrl: null,
        };
      }

      // Ottieni il primo capitolo
      const firstChapter = serie.chapters[0];

      // Ottieni l'autore dal capitolo
      const authorData = firstChapter.author;

      // Formatta i topics in modo più semplice per il frontend
      const formattedTopics = Array.isArray(firstChapter.topics)
        ? firstChapter.topics.map((topic) => ({
            id: topic.id?._id?.toString() || topic.id,
            name: topic.id?.name || "Argomento",
            slug: topic.id?.slug || "argomento",
            relevance: topic.relevance,
          }))
        : [];

      // Formatta i generi in modo più semplice per il frontend
      const formattedGenres = Array.isArray(firstChapter.genres)
        ? firstChapter.genres.map((genre) => ({
            id: genre.id?._id?.toString() || genre.id,
            name: genre.id?.name || "Genere",
            slug: genre.id?.slug || "genere",
            relevance: genre.relevance,
          }))
        : [];

      // Formatta le categorie
      const formattedCategories = Array.isArray(firstChapter.categories)
        ? firstChapter.categories.map((category) => ({
            id: category?._id?.toString() || category,
            name: category?.name || "Categoria",
            slug: category?.slug || "categoria",
          }))
        : [];

      return {
        ...serie,
        coverImage:
          serie.coverImage ||
          firstChapter.coverImage ||
          "/images/default-series-cover.jpg",
        description:
          serie.description || firstChapter.excerpt || "Serie in corso...",
        aiDescription: serie.aiDescription || firstChapter.aiDescription || "",
        author: authorData,
        topics: formattedTopics,
        genres: formattedGenres,
        categories:
          formattedCategories.length > 0
            ? formattedCategories
            : firstChapter.category
              ? [
                  {
                    id: firstChapter.category,
                    name: "Categoria",
                    slug: "categoria",
                  },
                ]
              : [],
        firstContentUrl: firstChapter.slug
          ? `/articoli/${firstChapter.slug}`
          : null,
      };
    });

    // Prepara i dati per il client
    const seriesData = enrichedSeries.map((serie) => ({
      id: serie._id.toString(),
      title: serie.title,
      slug: serie.title.toLowerCase().replace(/\s+/g, "-"),
      description: serie.description,
      aiDescription: serie.aiDescription,
      coverImage: serie.coverImage,
      author: serie.author
        ? {
            id: serie.author._id.toString(),
            name: serie.author.username,
            slug: serie.author.username?.toLowerCase().replace(/\s+/g, "-"),
            profileImg: serie.author.profileImg,
          }
        : null,
      isComplete: serie.isComplete,
      totalChapters: serie.totalChapters,
      totalViews: serie.totalViews || 0,
      totalLikes: serie.totalLikes || 0,
      topics: serie.topics || [],
      genres: serie.genres || [],
      categories: serie.categories || [],
      firstContentUrl: serie.firstContentUrl,
      readItems: 0, // Questo andrebbe personalizzato per utente se hai un sistema di autenticazione
      totalItems: serie.totalChapters,
      createdAt: serie.createdAt,
      updatedAt: serie.updatedAt,
    }));

    // Restituisci la risposta
    return NextResponse.json({
      series: seriesData,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("❌ Errore nel recupero delle serie:", error);
    return NextResponse.json(
      {
        error: "Errore durante il recupero delle serie",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
