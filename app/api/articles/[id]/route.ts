import { createClient } from "@supabase/supabase-js";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

import Article from "@/database/Article";
import Category from "@/database/Category";
import Genre from "@/database/Genre";
import Topic from "@/database/Topic";
import User from "@/database/User";
import dbConnect from "@/lib/mongoose";

// Definiamo le interfacce per i modelli
interface ICategory {
  _id: mongoose.Types.ObjectId | string;
  name: string;
}

interface IGenre {
  _id: mongoose.Types.ObjectId | string;
  name: string;
}

interface ITopic {
  _id: mongoose.Types.ObjectId | string;
  name: string;
}

interface IUser {
  _id: mongoose.Types.ObjectId | string;
  username: string;
  profileImg?: string;
  bio?: string;
}

// Interfaccia per il documento dell'articolo
interface IArticle {
  _id: mongoose.Types.ObjectId | string;
  title: string;
  chapterTitle?: string;
  chapterIndex?: number;
  markdownPath: string;
  coverImage: string;
  author: mongoose.Types.ObjectId | string | IUser;
  series?:
    | mongoose.Types.ObjectId
    | string
    | {
        _id: mongoose.Types.ObjectId | string;
        title: string;
        totalChapters: number;
        chapters: string[];
      };
  isSeriesChapter: boolean;
  genres?: Array<{
    id: mongoose.Types.ObjectId | string;
    relevance: number;
  }>;
  categories?: Array<mongoose.Types.ObjectId | string>;
  topics?: Array<{
    id: mongoose.Types.ObjectId | string;
    relevance: number;
  }>;
  publicationDate: Date;
  likeCount: number;
  comments: Array<mongoose.Types.ObjectId | string>;
  aiDescription?: string;
  embedding?: number[];
  createdAt: Date;
  [key: string]: any; // Per permettere altre proprietà
}

interface IFormattedCategory {
  id: string;
  name: string;
}

interface IFormattedGenreOrTopic {
  id: string;
  name: string;
  relevance: number;
}

interface IFormattedAuthor {
  _id: string;
  username: string;
  profileImg?: string;
  bio?: string;
}

interface IFormattedArticle {
  _id: string;
  title: string;
  chapterTitle?: string;
  chapterIndex?: number;
  markdownPath: string;
  coverImage: string;
  author: IFormattedAuthor | null;
  series?: {
    _id: string;
    title: string;
    totalChapters: number;
    chapters: string[];
  };
  isSeriesChapter: boolean;
  genres: IFormattedGenreOrTopic[];
  categories: IFormattedCategory[];
  topics: IFormattedGenreOrTopic[];
  publicationDate: Date;
  likeCount: number;
  comments: string[];
  aiDescription?: string;
  createdAt: Date;
}

// Interface for Mongoose lean documents (simplified)
type LeanDocument<T> = {
  _id: mongoose.Types.ObjectId;
} & Omit<T, "_id">;

// Interface for Series model
interface ISeries {
  _id: mongoose.Types.ObjectId | string;
  title: string;
  totalChapters: number;
  chapters: string[];
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  await dbConnect();

  try {
    // Recupera l'articolo senza populate
    const article = (await Article.findById(
      id,
    ).lean()) as unknown as LeanDocument<IArticle>;

    if (!article) {
      console.error("❌ Articolo non trovato!");
      return new NextResponse(
        JSON.stringify({ message: "Articolo non trovato" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Recupera manualmente le entità correlate
    const allCategories =
      article.categories && article.categories.length > 0
        ? ((await Category.find({
            _id: { $in: article.categories },
          }).lean()) as unknown as LeanDocument<ICategory>[])
        : [];

    // Define a genre item interface
    interface IGenreItem {
      id: mongoose.Types.ObjectId | string;
      relevance: number;
    }

    const genreIds: Array<mongoose.Types.ObjectId | string> =
      article.genres && article.genres.length > 0
        ? article.genres.map((g: IGenreItem) => g.id)
        : [];
    const allGenres =
      genreIds.length > 0
        ? ((await Genre.find({
            _id: { $in: genreIds },
          }).lean()) as unknown as LeanDocument<IGenre>[])
        : [];

    const topicIds: Array<mongoose.Types.ObjectId | string> =
      article.topics && article.topics.length > 0
        ? article.topics.map(
            (t: { id: mongoose.Types.ObjectId | string }) => t.id,
          )
        : [];
    const allTopics =
      topicIds.length > 0
        ? ((await Topic.find({
            _id: { $in: topicIds },
          }).lean()) as unknown as LeanDocument<ITopic>[])
        : [];

    // Recupera l'autore
    const author = article.author
      ? ((await User.findById(article.author)
          .select("_id username profileImg bio")
          .lean()) as unknown as LeanDocument<IUser>)
      : null;

    // Recupera informazioni sulla serie se presente
    let seriesData: LeanDocument<ISeries> | null = null;
    if (article.series) {
      seriesData = (await mongoose
        .model("Series")
        .findById(article.series)
        .select("_id title totalChapters chapters")
        .lean()) as unknown as LeanDocument<ISeries>;
    }

    // Crea mappe per lookup veloce
    const categoryMap = new Map(
      allCategories.map((category) => [category._id.toString(), category]),
    );
    const genreMap = new Map(
      allGenres.map((genre) => [genre._id.toString(), genre]),
    );
    const topicMap = new Map(
      allTopics.map((topic) => [topic._id.toString(), topic]),
    );

    // Funzione per convertire qualsiasi formato di ID in stringa
    const safeId = (id: any): string | null => {
      if (!id) return null;
      if (typeof id === "object" && id._id) return id._id.toString();
      return id.toString();
    };

    // Formatta le categorie
    const formattedCategories: IFormattedCategory[] = (
      article.categories || []
    ).map((catId: any) => {
      const id = safeId(catId);
      const category = id ? categoryMap.get(id) : undefined;
      return {
        id: id || "",
        name: category?.name || "Categoria Sconosciuta",
      };
    });

    // Formatta i generi
    const formattedGenres: IFormattedGenreOrTopic[] = [];
    if (Array.isArray(article.genres)) {
      article.genres.forEach((genre) => {
        const id = safeId(genre.id);
        if (id) {
          const genreObj = genreMap.get(id);
          formattedGenres.push({
            id,
            name: genreObj?.name || "Genere Sconosciuto",
            relevance:
              typeof genre.relevance === "number" ? genre.relevance : 0,
          });
        }
      });
    }

    // Formatta i topic
    const formattedTopics: IFormattedGenreOrTopic[] = [];
    if (Array.isArray(article.topics)) {
      article.topics.forEach((topic) => {
        const id = safeId(topic.id);
        if (id) {
          const topicObj = topicMap.get(id);
          formattedTopics.push({
            id,
            name: topicObj?.name || "Topic Sconosciuto",
            relevance:
              typeof topic.relevance === "number" ? topic.relevance : 0,
          });
        }
      });
    }

    // Crea l'articolo formattato
    const formattedArticle: IFormattedArticle = {
      _id: article._id.toString(),
      title: article.title,
      chapterTitle: article.chapterTitle,
      chapterIndex: article.chapterIndex,
      markdownPath: article.markdownPath,
      coverImage: article.coverImage,
      author: author
        ? {
            _id: author._id.toString(),
            username: author.username,
            profileImg: author.profileImg,
            bio: author.bio,
          }
        : null,
      categories: formattedCategories,
      genres: formattedGenres,
      topics: formattedTopics,
      series: seriesData
        ? {
            _id: seriesData._id.toString(),
            title: seriesData.title,
            totalChapters: seriesData.totalChapters,
            chapters: seriesData.chapters,
          }
        : undefined,
      isSeriesChapter: article.isSeriesChapter,
      publicationDate: article.publicationDate,
      likeCount: article.likeCount,
      comments: Array.isArray(article.comments)
        ? article.comments.map((c) =>
            typeof c === "string" ? c : c.toString(),
          )
        : [],
      aiDescription: article.aiDescription,
      createdAt: article.createdAt,
    };

    // Scarica il file Markdown da Supabase
    const { data, error } = await supabase.storage
      .from("articles-content")
      .download(article.markdownPath);

    if (error) {
      console.error("❌ Errore nel recupero del Markdown:", error.message);
      return new NextResponse(
        JSON.stringify({
          message: "Errore nel recupero del file Markdown",
          error: error.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const markdownText = await data.text();

    // Controlla se l'articolo fa parte di una serie e prepara i dati di navigazione
    let seriesInfo = null;
    if (seriesData) {
      seriesInfo = {
        seriesId: seriesData._id.toString(),
        seriesTitle: seriesData.title,
        chapterIndex: article.chapterIndex,
        totalChapters: seriesData.totalChapters,
        chapters: seriesData.chapters,
      };
    }

    return new NextResponse(
      JSON.stringify({
        message: "API funzionante",
        article: formattedArticle,
        markdownContent: markdownText,
        seriesInfo,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    console.error("❌ Errore API GET:", error);
    return new NextResponse(
      JSON.stringify({
        message: "Errore nel recupero dell'articolo",
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await dbConnect();

  // Aspetta la risoluzione della Promise per ottenere i parametri
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: "ID non fornito" }, { status: 400 });
    }

    const result = await Article.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json(
        { message: "Articolo non trovato" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: "Articolo eliminato con successo",
        deletedArticle: result,
      },
      { status: 200 },
    );
  } catch (error) {
    let errorMessage = "Errore sconosciuto";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        message: "Errore durante la cancellazione",
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
