import mongoose from "mongoose";

import Article from "@/database/Article";
import Category from "@/database/Category";
import Genre from "@/database/Genre";
import Topic from "@/database/Topic";
import dbConnect from "@/lib/mongoose";

/**
 * Funzione avanzata per ricalcolare i contatori con mappatura corretta dei nomi
 */
export async function recalculateCountersWithNames() {
  console.log("🔄 [DEBUG] Inizio ricalcolo contatori con mappatura nomi...");

  try {
    await dbConnect();
    console.log("✅ [DEBUG] Connessione al database stabilita");

    // Verifica se ci sono articoli
    const articleCount = await Article.countDocuments();
    console.log(`📊 [DEBUG] Trovati ${articleCount} articoli nel database`);

    if (articleCount === 0) {
      return {
        success: false,
        message: "Nessun articolo trovato. Impossibile calcolare i contatori.",
      };
    }

    // Fase 1: Reset contatori
    console.log("🧹 [DEBUG] Reset dei contatori...");
    await resetAllCounters();

    // Fase 2: Carica tutti i nomi per referenze corrette
    console.log("📋 [DEBUG] Caricamento mappe nomi...");
    const nameRegistry = await loadAllEntityNames();

    // Stampa alcuni esempi di nomi caricati
    console.log("📋 [DEBUG] Esempi nomi caricati:");
    if (nameRegistry.categories.size > 0) {
      const firstCatId = Array.from(nameRegistry.categories.keys())[0];
      console.log(
        `- Categoria: ID=${firstCatId}, Nome=${nameRegistry.categories.get(firstCatId)}`,
      );
    }
    if (nameRegistry.genres.size > 0) {
      const firstGenreId = Array.from(nameRegistry.genres.keys())[0];
      console.log(
        `- Genere: ID=${firstGenreId}, Nome=${nameRegistry.genres.get(firstGenreId)}`,
      );
    }
    if (nameRegistry.topics.size > 0) {
      const firstTopicId = Array.from(nameRegistry.topics.keys())[0];
      console.log(
        `- Topic: ID=${firstTopicId}, Nome=${nameRegistry.topics.get(firstTopicId)}`,
      );
    }

    // Fase 3: Carica gli articoli
    console.log("📚 [DEBUG] Caricamento articoli...");
    const articles = await Article.find()
      .select("_id title categories genres topics")
      .lean();

    console.log(`📚 [DEBUG] Caricati ${articles.length} articoli`);

    // Mostra struttura primo articolo
    if (articles.length > 0) {
      const firstArticle = articles[0];
      console.log(
        "🔍 [DEBUG] Primo articolo:",
        JSON.stringify(
          {
            id: firstArticle._id,
            title: firstArticle.title,
            categories: firstArticle.categories,
            genres: firstArticle.genres,
            topics: firstArticle.topics,
          },
          null,
          2,
        ),
      );
    }

    // Fase 4: Calcola i contatori utilizzando le mappe dei nomi
    console.log("🔢 [DEBUG] Calcolo contatori con nomi corretti...");
    const counters = calculateCounters(articles);

    // Fase 5: Aggiorna il database utilizzando le mappe dei nomi per i riferimenti
    console.log("💾 [DEBUG] Aggiornamento database con nomi corretti...");
    const updateResult = await updateDatabaseWithNames(counters, nameRegistry);

    console.log("✅ [DEBUG] Ricalcolo completato con successo!");
    return {
      success: true,
      message: `Contatori ricalcolati con successo. Aggiornati ${updateResult.totalUpdated} documenti.`,
      details: updateResult,
    };
  } catch (error) {
    console.error("❌ [DEBUG] Errore durante il ricalcolo:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Errore durante il ricalcolo: ${errorMessage}`,
    };
  }
}

/**
 * Reset di tutti i contatori
 */
async function resetAllCounters() {
  try {
    const resetCategory = await Category.updateMany(
      {},
      {
        $set: {
          totalArticles: 0,
          genreCounts: [],
          topicCounts: [],
          authorCounts: [],
        },
      },
    );

    const resetGenre = await Genre.updateMany(
      {},
      {
        $set: {
          totalArticles: 0,
          categoryCounts: [],
          topicCounts: [],
          authorCounts: [],
        },
      },
    );

    const resetTopic = await Topic.updateMany(
      {},
      {
        $set: {
          totalArticles: 0,
          categoryCounts: [],
          genreCounts: [],
          authorCounts: [],
        },
      },
    );

    console.log(
      `✅ [DEBUG] Reset completato - Cat: ${resetCategory.modifiedCount}, Genre: ${resetGenre.modifiedCount}, Topic: ${resetTopic.modifiedCount}`,
    );
  } catch (error) {
    console.error("❌ [DEBUG] Errore durante il reset:", error);
    throw error;
  }
}

/**
 * Carica i nomi di tutte le entità
 */
async function loadAllEntityNames() {
  const nameRegistry = {
    categories: new Map<string, string>(),
    genres: new Map<string, string>(),
    topics: new Map<string, string>(),
  };

  try {
    // Carica nomi categorie
    const categories = await Category.find().select("_id name").lean();
    categories.forEach((cat) =>
      nameRegistry.categories.set(
        (
          cat as unknown as { _id: mongoose.Types.ObjectId; name: string }
        )._id.toString(),
        (cat as unknown as { name: string }).name,
      ),
    );

    // Carica nomi generi
    const genres = await Genre.find().select("_id name").lean();
    genres.forEach((genre) =>
      nameRegistry.genres.set(
        (
          genre as unknown as { _id: mongoose.Types.ObjectId; name: string }
        )._id.toString(),
        (genre as unknown as { name: string }).name,
      ),
    );

    // Carica nomi topic
    const topics = await Topic.find().select("_id name").lean();
    topics.forEach((topic) =>
      nameRegistry.topics.set(
        (
          topic as unknown as { _id: mongoose.Types.ObjectId; name: string }
        )._id.toString(),
        (topic as unknown as { name: string }).name,
      ),
    );

    console.log(
      `📋 [DEBUG] Nomi caricati: ${categories.length} categorie, ${genres.length} generi, ${topics.length} topic`,
    );
    return nameRegistry;
  } catch (error) {
    console.error("❌ [DEBUG] Errore nel caricamento dei nomi:", error);
    return nameRegistry; // Ritorna il registro parziale anche in caso di errore
  }
}

/**
 * Calcola i contatori per tutte le entità
 */
function calculateCounters(
  articles: (mongoose.FlattenMaps<any> &
    Required<{ _id: unknown }> & { __v: number })[],
) {
  const counters = {
    categories: new Map(),
    genres: new Map(),
    topics: new Map(),
  };

  let processedRelations = 0;

  // Per ogni articolo
  for (const article of articles) {
    // Estrai ID assicurandoci che siano array validi
    const categoryIds = ensureValidArray(article.categories);
    const genreIds = ensureValidArray(article.genres);
    const topicIds = ensureValidArray(article.topics);

    // Per ogni categoria in questo articolo
    for (const categoryId of categoryIds) {
      const categoryIdStr = categoryId.toString();

      // Inizializza il contatore se non esiste
      if (!counters.categories.has(categoryIdStr)) {
        counters.categories.set(categoryIdStr, {
          totalArticles: 0,
          genres: new Map(),
          topics: new Map(),
        });
      }

      const categoryCounter = counters.categories.get(categoryIdStr);
      categoryCounter.totalArticles++;

      // Conta generi associati a questa categoria
      for (const genreId of genreIds) {
        const genreIdStr = genreId.toString();
        categoryCounter.genres.set(
          genreIdStr,
          (categoryCounter.genres.get(genreIdStr) || 0) + 1,
        );
        processedRelations++;
      }

      // Conta topic associati a questa categoria
      for (const topicId of topicIds) {
        const topicIdStr = topicId.toString();
        categoryCounter.topics.set(
          topicIdStr,
          (categoryCounter.topics.get(topicIdStr) || 0) + 1,
        );
        processedRelations++;
      }
    }

    // Per ogni genere in questo articolo
    for (const genreId of genreIds) {
      const genreIdStr = genreId.toString();

      // Inizializza il contatore se non esiste
      if (!counters.genres.has(genreIdStr)) {
        counters.genres.set(genreIdStr, {
          totalArticles: 0,
          categories: new Map(),
          topics: new Map(),
        });
      }

      const genreCounter = counters.genres.get(genreIdStr);
      genreCounter.totalArticles++;

      // Conta categorie associate a questo genere
      for (const categoryId of categoryIds) {
        const categoryIdStr = categoryId.toString();
        genreCounter.categories.set(
          categoryIdStr,
          (genreCounter.categories.get(categoryIdStr) || 0) + 1,
        );
        processedRelations++;
      }

      // Conta topic associati a questo genere
      for (const topicId of topicIds) {
        const topicIdStr = topicId.toString();
        genreCounter.topics.set(
          topicIdStr,
          (genreCounter.topics.get(topicIdStr) || 0) + 1,
        );
        processedRelations++;
      }
    }

    // Per ogni topic in questo articolo
    for (const topicId of topicIds) {
      const topicIdStr = topicId.toString();

      // Inizializza il contatore se non esiste
      if (!counters.topics.has(topicIdStr)) {
        counters.topics.set(topicIdStr, {
          totalArticles: 0,
          categories: new Map(),
          genres: new Map(),
        });
      }

      const topicCounter = counters.topics.get(topicIdStr);
      topicCounter.totalArticles++;

      // Conta categorie associate a questo topic
      for (const categoryId of categoryIds) {
        const categoryIdStr = categoryId.toString();
        topicCounter.categories.set(
          categoryIdStr,
          (topicCounter.categories.get(categoryIdStr) || 0) + 1,
        );
        processedRelations++;
      }

      // Conta generi associati a questo topic
      for (const genreId of genreIds) {
        const genreIdStr = genreId.toString();
        topicCounter.genres.set(
          genreIdStr,
          (topicCounter.genres.get(genreIdStr) || 0) + 1,
        );
        processedRelations++;
      }
    }
  }

  console.log(
    `✅ [DEBUG] Conteggio completato: ${processedRelations} relazioni processate`,
  );
  return counters;
}

/**
 * Assicura che l'input sia un array valido
 */
function ensureValidArray(input: any) {
  if (!input) return [];
  if (!Array.isArray(input)) return [input];
  return input;
}

/**
 * Aggiorna il database con i contatori calcolati utilizzando nomi corretti
 */
async function updateDatabaseWithNames(
  counters: { categories: any; genres: any; topics: any },
  nameRegistry: { categories: any; genres: any; topics: any },
) {
  let categoryUpdates = 0;
  let genreUpdates = 0;
  let topicUpdates = 0;

  // Funzione per convertire una mappa di conteggi in un array di CountItem
  function mapToCountItems(
    map: any[],
    namesMap: { get: (arg0: any) => string },
  ) {
    return Array.from(map.entries())
      .filter(([id, count]) => count > 0)
      .map(([id, count]) => {
        try {
          const objectId = new mongoose.Types.ObjectId(id);
          // Utilizza la mappa dei nomi per assicurare che il nome sia corretto
          const name = namesMap.get(id) || "Sconosciuto";
          return { id: objectId, name, count };
        } catch (error) {
          console.error(`❌ [DEBUG] Errore conversione ID ${id}:`, error);
          return null;
        }
      })
      .filter((item) => item !== null);
  }

  // Aggiorna categorie
  console.log(
    `🔄 [DEBUG] Aggiornamento ${counters.categories.size} categorie...`,
  );
  for (const [categoryId, data] of counters.categories.entries()) {
    try {
      // Crea CountItem arrays con i nomi corretti
      const genreCounts = mapToCountItems(data.genres, nameRegistry.genres);
      const topicCounts = mapToCountItems(data.topics, nameRegistry.topics);

      // Log del primo aggiornamento per debug
      if (categoryUpdates === 0 && genreCounts.length > 0) {
        console.log("🔍 [DEBUG] Esempio aggiornamento categoria:");
        console.log(
          `- Categoria: ${nameRegistry.categories.get(categoryId) || categoryId}`,
        );
        console.log(`- Primo genere: ${JSON.stringify(genreCounts[0])}`);
      }

      const result = await Category.updateOne(
        { _id: categoryId },
        {
          $set: {
            totalArticles: data.totalArticles,
            genreCounts: genreCounts,
            topicCounts: topicCounts,
          },
        },
      );

      if (result.modifiedCount > 0) categoryUpdates++;
    } catch (error) {
      console.error(
        `❌ [DEBUG] Errore aggiornamento categoria ${categoryId}:`,
        error,
      );
    }
  }

  // Aggiorna generi
  console.log(`🔄 [DEBUG] Aggiornamento ${counters.genres.size} generi...`);
  for (const [genreId, data] of counters.genres.entries()) {
    try {
      // Crea CountItem arrays con i nomi corretti
      const categoryCounts = mapToCountItems(
        data.categories,
        nameRegistry.categories,
      );
      const topicCounts = mapToCountItems(data.topics, nameRegistry.topics);

      const result = await Genre.updateOne(
        { _id: genreId },
        {
          $set: {
            totalArticles: data.totalArticles,
            categoryCounts: categoryCounts,
            topicCounts: topicCounts,
          },
        },
      );

      if (result.modifiedCount > 0) genreUpdates++;
    } catch (error) {
      console.error(
        `❌ [DEBUG] Errore aggiornamento genere ${genreId}:`,
        error,
      );
    }
  }

  // Aggiorna topic
  console.log(`🔄 [DEBUG] Aggiornamento ${counters.topics.size} topic...`);
  for (const [topicId, data] of counters.topics.entries()) {
    try {
      // Crea CountItem arrays con i nomi corretti
      const categoryCounts = mapToCountItems(
        data.categories,
        nameRegistry.categories,
      );
      const genreCounts = mapToCountItems(data.genres, nameRegistry.genres);

      const result = await Topic.updateOne(
        { _id: topicId },
        {
          $set: {
            totalArticles: data.totalArticles,
            categoryCounts: categoryCounts,
            genreCounts: genreCounts,
          },
        },
      );

      if (result.modifiedCount > 0) topicUpdates++;
    } catch (error) {
      console.error(`❌ [DEBUG] Errore aggiornamento topic ${topicId}:`, error);
    }
  }

  const totalUpdated = categoryUpdates + genreUpdates + topicUpdates;
  console.log(`✅ [DEBUG] Aggiornamenti completati: ${totalUpdated} totali`);
  console.log(`   - Categorie: ${categoryUpdates}`);
  console.log(`   - Generi: ${genreUpdates}`);
  console.log(`   - Topic: ${topicUpdates}`);

  return {
    categoryUpdates,
    genreUpdates,
    topicUpdates,
    totalUpdated,
  };
}

export default recalculateCountersWithNames;
