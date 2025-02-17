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
  if (query.has("authors"))
    filters.authors = query.get("authors")!.split(",").map(capitalize);
  if (query.has("genres"))
    filters.genres = query.get("genres")!.split(",").map(capitalize);
  if (query.has("topics"))
    filters.topics = query.get("topics")!.split(",").map(capitalize);
  return filters;
};

interface Filters {
  authors?: string[];
  genres?: string[];
  topics?: string[];
}

export async function GET(
  req: NextRequest,
  context: { params: { categoria: string } },
) {
  await dbConnect();

  try {
    // 1️⃣ Estrarre la categoria dalla route e capitalizzarla
    let { categoria } = context.params;
    categoria = capitalize(categoria);

    console.log("🔍 Categoria richiesta:", categoria);

    // 2️⃣ Trovare l'ID della categoria corrispondente
    const category = await Category.findOne({ name: categoria }).select("_id");
    if (!category) {
      console.error("❌ Categoria non trovata!");
      return NextResponse.json(
        { message: "Categoria non trovata" },
        { status: 404 },
      );
    }

    console.log("✅ Categoria trovata, ID:", category._id);

    // 3️⃣ Estrarre e capitalizzare i filtri dalla query string
    console.log("🔍 Query string:", new URL(req.url).searchParams);
    const filters = parseFilters(new URL(req.url).searchParams);
    console.log("🔍 Filtri richiesti:", filters);

    let query: Record<string, any> = { categories: category._id };

    // 4️⃣ Convertire nomi in ID per gli altri filtri (authors, genres, topics)
    if (filters.authors) {
      const authors = await User.find({
        username: { $in: filters.authors },
      }).select("_id");
      query.author = { $in: authors.map((a) => a._id) };
    }

    if (filters.genres) {
      const genres = await Genre.find({ name: { $in: filters.genres } }).select(
        "_id",
      );
      query.genres = { $in: genres.map((g) => g._id) };
    }

    if (filters.topics) {
      const topics = await Topic.find({ name: { $in: filters.topics } }).select(
        "_id",
      );
      query.topics = { $in: topics.map((t) => t._id) };
    }

    console.log("🔎 Query finale per gli articoli:", query);

    // 5️⃣ Eseguire la query degli articoli
    const articles: IArticle[] = await Article.find(query)
      .populate("author", "username")
      .populate("categories", "name")
      .populate("genres", "name")
      .populate("topics", "name")
      .sort({ createdAt: -1 })
      .lean<IArticle[]>();

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