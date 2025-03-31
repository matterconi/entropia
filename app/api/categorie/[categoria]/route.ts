import mongoose from "mongoose";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import Article from "@/database/Article";
import Category from "@/database/Category";
import Genre from "@/database/Genre";
import Topic from "@/database/Topic";
import User from "@/database/User";
import dbConnect from "@/lib/mongoose";

// Definiamo le interfacce per i modelli
interface ICategory {
  _id: string | { toString(): string };
  name: string;
}

interface IGenre {
  _id: string | { toString(): string };
  name: string;
}

interface ITopic {
  _id: string | { toString(): string };
  name: string;
}

interface IUser {
  _id: string | { toString(): string };
  username: string;
  profileImg?: string;
}

interface IArticle {
  _id: string | { toString(): string };
  title: string;
  chapterTitle?: string;
  chapterIndex?: number;
  markdownPath: string;
  coverImage: string;
  author: string | { toString(): string } | IUser;
  series?: string | { toString(): string };
  isSeriesChapter: boolean;
  genres: Array<{
    id: string | { toString(): string };
    relevance: number;
  }>;
  categories: Array<string | { toString(): string }>;
  topics: Array<{
    id: string | { toString(): string };
    relevance: number;
  }>;
  publicationDate: Date;
  likeCount: number;
  comments: Array<string | { toString(): string }>;
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
}

interface IFormattedArticle
  extends Omit<IArticle, "categories" | "genres" | "topics" | "author"> {
  categories: IFormattedCategory[];
  genres: IFormattedGenreOrTopic[];
  topics: IFormattedGenreOrTopic[];
  author: IFormattedAuthor | null;
}

interface Filters {
  authors?: string[];
  genres?: string[];
  topics?: string[];
  sort?: string;
  searchQuery?: string;
  limit?: number;
}

/**
 * Funzione per estrarre e normalizzare i filtri dalla query string
 */
const parseFilters = (query: URLSearchParams): Filters => {
  const filters: Filters = {};

  // Estrazione degli autori - non applichiamo capitalize perché i nomi utente potrebbero essere case-sensitive
  if (query.has("authors")) {
    filters.authors = query
      .get("authors")!
      .split(",")
      .map((author) => decodeURIComponent(author.trim()));
    console.log("🧑‍💻 Autori richiesti:", filters.authors);
  }

  if (query.has("genres"))
    filters.genres = query
      .get("genres")!
      .split(",")
      .map((genre) => genre.trim());

  if (query.has("topics"))
    filters.topics = query
      .get("topics")!
      .split(",")
      .map((topic) => topic.trim());

  if (query.has("sort")) filters.sort = query.get("sort")!;

  // Estrazione del parametro query per la ricerca di testo
  if (query.has("query")) {
    filters.searchQuery = query.get("query")!.trim();
    console.log("🔍 Query di ricerca:", filters.searchQuery);
  }

  // Estrazione del parametro limit per la paginazione
  if (query.has("limit")) {
    const limitParam = parseInt(query.get("limit")!, 10);
    if (!isNaN(limitParam) && limitParam > 0) {
      filters.limit = limitParam;
      console.log("📊 Limit:", filters.limit);
    }
  }

  return filters;
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ categoria: string }> },
) {
  await dbConnect();

  try {
    // Risolviamo la Promise e estraiamo la categoria
    const { categoria } = await params;

    console.log("🔍 Categoria richiesta:", categoria);

    // 2️⃣ Trovare l'ID della categoria corrispondente
    const category = await Category.findOne({
      name: categoria,
    }).select("_id");
    if (!category) {
      console.error("❌ Categoria non trovata!");
      return NextResponse.json(
        { message: "Categoria non trovata" },
        { status: 404 },
      );
    }

    console.log("✅ Categoria trovata, ID:", category._id);

    // 3️⃣ Estrarre e normalizzare i filtri dalla query string
    console.log("🔍 Query string completa:", req.url);
    const filters = parseFilters(new URL(req.url).searchParams);
    console.log("🔍 Filtri elaborati:", filters);

    // Inizializziamo la query con la categoria
    let query: Record<string, any> = { categories: category._id };

    // Condizioni per costruire la query con operatori OR per generi e topic
    let orConditions: any[] = [];

    // 4️⃣ Gestione del filtro per autori
    if (filters.authors && filters.authors.length > 0) {
      // Cerca gli utenti che corrispondono ai nomi utente forniti
      const authors = await User.find({
        username: { $in: filters.authors },
      }).select("_id");

      console.log(`✅ Trovati ${authors.length} autori corrispondenti`);

      if (authors.length > 0) {
        // Aggiungiamo la condizione per gli autori (filtro esclusivo - AND)
        query.author = { $in: authors.map((a) => a._id) };
      } else {
        // Se non sono stati trovati autori, restituisci un array vuoto
        console.log("⚠️ Nessun autore trovato con i nomi forniti");
        return NextResponse.json(
          { message: "No authors found matching the criteria", articles: [] },
          { status: 200 },
        );
      }
    }

    // Costruiamo le condizioni per i generi (filtro inclusivo - OR)
    if (filters.genres && filters.genres.length > 0) {
      const genres = await Genre.find({ name: { $in: filters.genres } }).select(
        "_id",
      );

      if (genres.length > 0) {
        // Creiamo una condizione per includere articoli che hanno uno qualsiasi dei generi selezionati
        // Adattato per il nuovo modello: cerchiamo nell'array di oggetti "genres", nel campo "id"
        orConditions.push({ "genres.id": { $in: genres.map((g) => g._id) } });
      }
    }

    // Costruiamo le condizioni per i topic (filtro inclusivo - OR)
    if (filters.topics && filters.topics.length > 0) {
      const topics = await Topic.find({ name: { $in: filters.topics } }).select(
        "_id",
      );

      if (topics.length > 0) {
        // Creiamo una condizione per includere articoli che hanno uno qualsiasi dei topic selezionati
        // Adattato per il nuovo modello: cerchiamo nell'array di oggetti "topics", nel campo "id"
        orConditions.push({ "topics.id": { $in: topics.map((t) => t._id) } });
      }
    }

    // Aggiungiamo la ricerca per testo se è presente una query di ricerca
    if (filters.searchQuery && filters.searchQuery.length > 0) {
      // Creiamo un indice di ricerca in più campi: titolo, sottotitolo, contenuto e tag
      const searchRegex = new RegExp(filters.searchQuery, "i"); // 'i' per case-insensitive

      // Aggiungiamo una condizione $or per cercare in diversi campi dell'articolo
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: searchRegex },
          { chapterTitle: searchRegex },
          { aiDescription: searchRegex },
        ],
      });

      console.log("🔍 Aggiunta ricerca di testo per:", filters.searchQuery);
    }

    // Se ci sono condizioni OR per generi e topics, le aggiungiamo alla query principale
    if (orConditions.length > 0) {
      // Se esiste già una condizione $and, aggiungiamo l'$or a quella
      if (query.$and) {
        query.$and.push({ $or: orConditions });
      } else {
        query.$or = orConditions;
      }
    }

    console.log(
      "🔎 Query finale per gli articoli:",
      JSON.stringify(query, null, 2),
    );

    // Determina l'ordinamento in base al parametro sort
    let sortOptions: any = { createdAt: -1 }; // Ordinamento predefinito: dal più recente

    if (filters.sort) {
      switch (filters.sort) {
        case "alphabetical":
          sortOptions = { title: 1 }; // Ordine alfabetico (A-Z)
          break;
        case "new":
          sortOptions = { publicationDate: -1 }; // Dal più recente
          break;
        case "old":
          sortOptions = { publicationDate: 1 }; // Dal più vecchio
          break;
        case "likes":
          sortOptions = { likeCount: -1 }; // Dal più liked
          break;
        case "views":
          // Ignoriamo l'opzione views per ora
          console.log(
            "⚠️ L'ordinamento per visualizzazioni non è ancora implementato",
          );
          sortOptions = { createdAt: -1 }; // Fallback all'ordinamento predefinito
          break;
        default:
          // Manteniamo l'ordinamento predefinito
          sortOptions = { createdAt: -1 };
      }
    }

    console.log("🔄 Ordinamento applicato:", sortOptions);

    // Applicare limit se specificato
    let articlesQuery = Article.find(query).sort(sortOptions);

    if (filters.limit) {
      articlesQuery = articlesQuery.limit(filters.limit);
    }

    // Eseguiamo la query senza popolamento
    const articles = (await articlesQuery.lean()) as unknown as IArticle[];

    // Recupera tutte le categorie, generi, topic e autori necessari per la formattazione manuale
    const allCategories =
      (await Category.find().lean()) as unknown as ICategory[];
    const allGenres = (await Genre.find().lean()) as unknown as IGenre[];
    const allTopics = (await Topic.find().lean()) as unknown as ITopic[];

    // Ottieni tutti gli ID autori dagli articoli
    const authorIds = articles.map((article) => article.author).filter(Boolean);
    const allAuthors = (await User.find({ _id: { $in: authorIds } })
      .select("_id username profileImg")
      .lean()) as unknown as IUser[];

    // Crea mappe per lookup veloce
    const categoryMap = new Map<string, ICategory>(
      allCategories.map((category) => [category._id.toString(), category]),
    );
    const genreMap = new Map<string, IGenre>(
      allGenres.map((genre) => [genre._id.toString(), genre]),
    );
    const topicMap = new Map<string, ITopic>(
      allTopics.map((topic) => [topic._id.toString(), topic]),
    );
    const authorMap = new Map<string, IUser>(
      allAuthors.map((author) => [author._id.toString(), author]),
    );

    // Funzione per convertire qualsiasi formato di ID in stringa
    const safeId = (id: any): string | null => {
      if (!id) return null;
      if (typeof id === "object" && id._id) return id._id.toString();
      return id.toString();
    };

    // Formatta gli articoli nel nuovo formato
    const formattedArticles: IFormattedArticle[] = articles.map((article) => {
      // Gestisci categorie
      const safeCategories: IFormattedCategory[] = (
        article.categories || []
      ).map((catId) => {
        const id = safeId(catId);
        const category = id ? categoryMap.get(id) : undefined;
        return {
          id: id || "",
          name: category?.name || "Categoria Sconosciuta",
        };
      });

      // Gestisci i generi - adattato per il nuovo modello
      const safeGenres: IFormattedGenreOrTopic[] = [];
      if (Array.isArray(article.genres)) {
        article.genres.forEach((genre) => {
          const id = safeId(genre.id);
          if (id) {
            const genreObj = genreMap.get(id);
            safeGenres.push({
              id,
              name: genreObj?.name || "Genere Sconosciuto",
              relevance:
                typeof genre.relevance === "number" ? genre.relevance : 0,
            });
          }
        });
      }

      // Gestisci i topic - adattato per il nuovo modello
      const safeTopics: IFormattedGenreOrTopic[] = [];
      if (Array.isArray(article.topics)) {
        article.topics.forEach((topic) => {
          const id = safeId(topic.id);
          if (id) {
            const topicObj = topicMap.get(id);
            safeTopics.push({
              id,
              name: topicObj?.name || "Topic Sconosciuto",
              relevance:
                typeof topic.relevance === "number" ? topic.relevance : 0,
            });
          }
        });
      }

      // Gestisci l'autore
      const authorId = safeId(article.author);
      const author = authorId ? authorMap.get(authorId) : null;

      // Restituisci l'articolo formattato
      return {
        ...article,
        _id: article._id.toString(),
        author: author
          ? {
              _id: authorId!,
              username: author.username,
              profileImg: author.profileImg,
            }
          : null,
        categories: safeCategories,
        genres: safeGenres,
        topics: safeTopics,
      };
    });

    console.log(`✅ Trovati e formattati ${formattedArticles.length} articoli`);

    return NextResponse.json(
      {
        message: "Articles retrieved successfully",
        articles: formattedArticles,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("❌ Errore nel fetch degli articoli:", error);
    return NextResponse.json(
      { message: "Failed to fetch articles", error: error.message },
      { status: 500 },
    );
  }
}
