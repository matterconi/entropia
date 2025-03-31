import { NextRequest, NextResponse } from "next/server";

import Category from "@/database/Category";
import Genre from "@/database/Genre";
import Topic from "@/database/Topic";
import dbConnect from "@/lib/mongoose";
import { denormalizeSlug } from "@/lib/normalizeSlug";

interface GenreCount {
  id: any; // Using 'any' as we don't know the exact type but it has toString()
  name: string;
  count: number;
}

interface FilterCountResult {
  id: string;
  name: string;
  count: number;
}

interface FilterModelItem {
  _id: {
    toString(): string;
  };
  name: string;
  totalArticles: number;
}

/**
 * Funzione per estrarre e normalizzare i filtri dalla query string
 */
const parseFilters = (query: URLSearchParams) => {
  const filters: any = {};
  if (query.has("categories"))
    filters.categories = query
      .get("categories")!
      .split(",")
      .map((s) => s.trim());
  if (query.has("genres"))
    filters.genres = query
      .get("genres")!
      .split(",")
      .map((s) => s.trim());
  if (query.has("topics"))
    filters.topics = query
      .get("topics")!
      .split(",")
      .map((s) => s.trim());
  return filters;
};

/**
 * Funzione di utility per convertire in modo sicuro un array di conteggi
 */
const safeMapCounts = <T extends { id: any; name: string; count: number }>(
  counts: T[] | undefined | null,
): FilterCountResult[] => {
  if (!counts || !Array.isArray(counts)) {
    return [];
  }

  return counts
    .map((item) => ({
      id: item.id?.toString() || "",
      name: item.name || "Sconosciuto",
      count: item.count || 0,
    }))
    .filter((item) => item.count > 0);
};

/**
 * API ottimizzata per ottenere il conteggio degli articoli usando i contatori denormalizzati
 */
export async function GET(req: NextRequest) {
  try {
    console.log(
      "🔹 API /api/filter-counts (ottimizzata): Calcolo conteggi filtri...",
    );
    const startTime = performance.now();

    await dbConnect();

    // Estrai i parametri dalla URL
    const url = new URL(req.url);
    const pageType = url.searchParams.get("pageType") || "";
    const pageValue =
      denormalizeSlug(url.searchParams.get("pageValue") || "") || "";

    console.log("📩 Parametri pagina:", pageType, pageValue);

    // Estrai i filtri dalla query string
    const appliedFilters = parseFilters(url.searchParams);
    console.log("🔍 Filtri applicati:", appliedFilters);

    // Prepara l'oggetto risultato
    const result: any = {};

    // Determina quali tipi di filtri calcolare
    // (escludendo quello corrispondente alla pagina corrente)
    const filtersToCalculate = ["categories", "genres", "topics"].filter(
      (filter) =>
        !(pageType === "categoria" && filter === "categories") &&
        !(pageType === "genere" && filter === "genres") &&
        !(pageType === "topic" && filter === "topics"),
    );

    // CASO 1: Siamo su una pagina di categoria specifica
    if (pageType === "categorie" && pageValue) {
      const category = await Category.findOne({ name: pageValue });

      if (category) {
        console.log(`📊 Categoria trovata: ${category.name} (${category._id})`);

        // Log per debug dei campi denormalizzati
        console.log(
          `📊 Campi disponibili: ${Object.keys(category._doc || {}).join(", ")}`,
        );
        console.log(`📊 genreCounts esiste: ${Boolean(category.genreCounts)}`);
        console.log(`📊 topicCounts esiste: ${Boolean(category.topicCounts)}`);

        // Ottieni i conteggi dai campi denormalizzati della categoria
        if (filtersToCalculate.includes("genres")) {
          result.genres = safeMapCounts(category.genreCounts);
        }

        if (filtersToCalculate.includes("topics")) {
          result.topics = safeMapCounts(category.topicCounts);
        }
      } else {
        console.log(`❌ Categoria non trovata: ${pageValue}`);
      }
    }
    // CASO 2: Siamo su una pagina di genere specifica
    else if (pageType === "generi" && pageValue) {
      const genre = await Genre.findOne({ name: pageValue });

      if (genre) {
        console.log(`📊 Genere trovato: ${genre.name} (${genre._id})`);
        console.log(
          `📊 Campi disponibili: ${Object.keys(genre._doc || {}).join(", ")}`,
        );

        // Ottieni i conteggi dai campi denormalizzati del genere
        if (filtersToCalculate.includes("categories")) {
          result.categories = safeMapCounts(genre.categoryCounts);
        }

        if (filtersToCalculate.includes("topics")) {
          result.topics = safeMapCounts(genre.topicCounts);
        }
      } else {
        console.log(`❌ Genere non trovato: ${pageValue}`);
      }
    }
    // CASO 3: Siamo su una pagina di topic specifica
    else if (pageType === "topics" && pageValue) {
      const topic = await Topic.findOne({ name: pageValue });

      if (topic) {
        console.log(`📊 Topic trovato: ${topic.name} (${topic._id})`);
        console.log(
          `📊 Campi disponibili: ${Object.keys(topic._doc || {}).join(", ")}`,
        );

        // Ottieni i conteggi dai campi denormalizzati del topic
        if (filtersToCalculate.includes("categories")) {
          result.categories = safeMapCounts(topic.categoryCounts);
        }

        if (filtersToCalculate.includes("genres")) {
          result.genres = safeMapCounts(topic.genreCounts);
        }
      } else {
        console.log(`❌ Topic non trovato: ${pageValue}`);
      }
    }
    // CASO 4: Siamo sulla home o una pagina generica
    else {
      // Recupera i conteggi totali da ogni modello
      for (const filterType of filtersToCalculate) {
        let model;
        switch (filterType) {
          case "categories":
            model = Category;
            break;
          case "genres":
            model = Genre;
            break;
          case "topics":
            model = Topic;
            break;
        }

        if (model) {
          const items = await model.find().lean();
          result[filterType] = items
            .filter((item: any) => item.totalArticles > 0)
            .map((item: any) => ({
              id: item._id.toString(),
              name: item.name,
              count: item.totalArticles,
            }));
        }
      }
    }

    // Gestione dei filtri incrociati (quando si selezionano più filtri contemporaneamente)
    // Questo è più complesso e richiederebbe ulteriore logica per la denormalizzazione
    // Per ora, se ci sono filtri applicati, li manteniamo come sono
    for (const [filterType, values] of Object.entries(appliedFilters) as [
      string,
      string[],
    ][]) {
      if (!result[filterType]) result[filterType] = [];

      // Aggiungi i filtri già selezionati se non sono già inclusi
      for (const filterName of values) {
        const alreadyIncluded = result[filterType].some(
          (item: any) => item.name === filterName,
        );

        if (!alreadyIncluded) {
          // Recupera l'ID del filtro
          const model =
            filterType === "categories"
              ? Category
              : filterType === "genres"
                ? Genre
                : Topic;

          const filter = await model.findOne({ name: filterName });

          if (filter) {
            result[filterType].push({
              id: filter._id.toString(),
              name: filterName,
              count: 0, // Impostiamo a 0 perché non ci sono articoli corrispondenti
            });
          }
        }
      }
    }

    const endTime = performance.now();
    console.log(
      `✅ Conteggi calcolati con successo in ${(endTime - startTime).toFixed(2)}ms.`,
    );
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("❌ Errore API /api/filter-counts (GET):", error.message);
    return NextResponse.json(
      { error: "Internal Server Error: " + error.message },
      { status: 500 },
    );
  }
}
