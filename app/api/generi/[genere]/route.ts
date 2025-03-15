import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import Article, { IArticle } from "@/database/Article";
import Category from "@/database/Category";
import Genre from "@/database/Genre";
import Topic from "@/database/Topic";
import User from "@/database/User";
import dbConnect from "@/lib/mongoose";

/**
 * Funzione per capitalizzare i nomi (es. "fantasy" → "Fantasy")
 */
const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

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

  if (query.has("categories"))
    filters.categories = query
      .get("categories")!
      .split(",")
      .map((category) => capitalize(category.trim()));

  if (query.has("topics"))
    filters.topics = query
      .get("topics")!
      .split(",")
      .map((topic) => capitalize(topic.trim()));

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

interface Filters {
  authors?: string[];
  categories?: string[];
  topics?: string[];
  sort?: string;
  searchQuery?: string;
  limit?: number;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ genere: string }> },
) {
  await dbConnect();

  try {
    // Risolviamo la Promise e estraiamo il genere
    const { genere } = await params;
    // Capitalizziamo il genere
    const capitalizedGenere = capitalize(genere);

    console.log("🔍 Genere richiesto:", genere);

    // Trovare l'ID del genere corrispondente
    const genre = await Genre.findOne({
      name: capitalizedGenere,
    }).select("_id");
    if (!genre) {
      console.error("❌ Genere non trovato!");
      return NextResponse.json(
        { message: "Genere non trovato" },
        { status: 404 },
      );
    }

    console.log("✅ Genere trovato, ID:", genre._id);

    // Estrarre e normalizzare i filtri dalla query string
    console.log("🔍 Query string completa:", req.url);
    const filters = parseFilters(new URL(req.url).searchParams);
    console.log("🔍 Filtri elaborati:", filters);

    // Inizializziamo la query con il genere
    let query: Record<string, any> = { genres: genre._id };

    // Condizioni per costruire la query con operatori OR per categorie e topic
    let orConditions: any[] = [];

    // Gestione del filtro per autori
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

    // Costruiamo le condizioni per le categorie (filtro inclusivo - OR)
    if (filters.categories && filters.categories.length > 0) {
      const categories = await Category.find({
        name: { $in: filters.categories },
      }).select("_id");

      if (categories.length > 0) {
        // Creiamo una condizione per includere articoli che hanno una qualsiasi delle categorie selezionate
        orConditions.push({
          categories: { $in: categories.map((c) => c._id) },
        });
      }
    }

    // Costruiamo le condizioni per i topic (filtro inclusivo - OR)
    if (filters.topics && filters.topics.length > 0) {
      const topics = await Topic.find({
        name: { $in: filters.topics },
      }).select("_id");

      if (topics.length > 0) {
        // Creiamo una condizione per includere articoli che hanno uno qualsiasi dei topic selezionati
        orConditions.push({ topics: { $in: topics.map((t) => t._id) } });
      }
    }

    // Aggiungiamo la ricerca per testo se è presente una query di ricerca
    if (filters.searchQuery && filters.searchQuery.length > 0) {
      // Creiamo un indice di ricerca in più campi: titolo
      const searchRegex = new RegExp(filters.searchQuery, "i"); // 'i' per case-insensitive

      // Aggiungiamo una condizione $or per cercare in diversi campi dell'articolo
      query.$and = query.$and || [];
      query.$and.push({
        $or: [{ title: searchRegex }],
      });

      console.log("🔍 Aggiunta ricerca di testo per:", filters.searchQuery);
    }

    // Se ci sono condizioni OR per categorie e topics, le aggiungiamo alla query principale
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

    // Prepariamo la query base
    let articlesQuery = Article.find(query)
      .populate("categories", "name")
      .populate("genres", "name")
      .populate("topics", "name")
      .populate("author", "username profileImg") // Aggiungiamo profileImg per avere l'immagine dell'autore
      .sort(sortOptions);

    // Applichiamo il limite se specificato
    if (filters.limit) {
      articlesQuery = articlesQuery.limit(filters.limit);
    }

    // Eseguire la query degli articoli con l'ordinamento specificato
    const articles: IArticle[] = await articlesQuery.lean<IArticle[]>();

    console.log(`✅ Trovati ${articles.length} articoli`);

    return NextResponse.json(
      { message: "Articles retrieved successfully", articles },
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
