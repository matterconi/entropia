// lib/tagProcessing.ts
import Category from "@/database/Category";
import Genre from "@/database/Genre";
import Topic from "@/database/Topic";

interface ProcessedTagsResult {
  categoryIds: string[];
  genresWithRelevance: Array<{ id: string; relevance: number }>;
  topicsWithRelevance: Array<{ id: string; relevance: number }>;
}

/**
 * Trova o crea le entità di tag e restituisce i loro IDs con le informazioni di rilevanza
 */
export async function processContentTags(
  categories: string[],
  genres: string[],
  topics: string[],
): Promise<ProcessedTagsResult> {
  // Converti i nomi delle categorie, generi e topic in ObjectId
  const categoryIds = await Promise.all(
    categories.map(async (categoryName) => {
      // Assicurati che il nome sia in minuscolo
      const nameLowercase = categoryName.toLowerCase();

      let category = await Category.findOne({
        name: nameLowercase,
      });

      // Se la categoria non esiste, creala (con nome in minuscolo)
      if (!category) {
        console.log(
          `⚠️ Categoria non trovata nel database: "${nameLowercase}", creazione automatica...`,
        );
        category = await Category.create({ name: nameLowercase });
        console.log(`✅ Nuova categoria creata: ${nameLowercase}`);
      } else {
        console.log(
          `✅ Categoria trovata nel database: ${category.name} (ID: ${category._id})`,
        );
      }

      return category._id;
    }),
  );

  // Trova o crea record per i generi con informazioni di rilevanza
  const genresWithRelevance = await Promise.all(
    genres.map(async (genreName: string, index: number) => {
      // Assicurati che il nome sia in minuscolo
      const nameLowercase = genreName.toLowerCase();

      let genre = await Genre.findOne({ name: nameLowercase });

      if (!genre) {
        // Crea un nuovo genere se non esiste (con nome in minuscolo)
        genre = await Genre.create({
          name: nameLowercase,
          totalArticles: 0,
          categoryCounts: [],
          topicCounts: [],
          authorCounts: [],
        });
        console.log(`✅ Nuovo genere creato nel database: ${nameLowercase}`);
      }

      return {
        id: genre._id,
        relevance: index + 1, // 1 = più rilevante, 2 = secondo più rilevante, ecc.
      };
    }),
  );

  // Trova o crea record per i topic con informazioni di rilevanza
  const topicsWithRelevance = await Promise.all(
    topics.map(async (topicName: string, index: number) => {
      // Assicurati che il nome sia in minuscolo
      const nameLowercase = topicName.toLowerCase();

      let topic = await Topic.findOne({ name: nameLowercase });

      if (!topic) {
        // Crea un nuovo topic se non esiste (con nome in minuscolo)
        topic = await Topic.create({
          name: nameLowercase,
          totalArticles: 0,
          categoryCounts: [],
          genreCounts: [],
          authorCounts: [],
        });
        console.log(`✅ Nuovo topic creato nel database: ${nameLowercase}`);
      }

      return {
        id: topic._id,
        relevance: index + 1,
      };
    }),
  );

  console.log("🔹 ID e rilevanza processati:", {
    categoryIds,
    genresWithRelevance,
    topicsWithRelevance,
  });

  return {
    categoryIds,
    genresWithRelevance,
    topicsWithRelevance,
  };
}

/**
 * Trova gli ID di tag esistenti in base ai nomi
 */
export async function findTagIds(
  categories: string[] = [],
  genres: string[] = [],
  topics: string[] = [],
) {
  // Trova le categorie in base ai nomi
  const categoryIds = await Category.find({
    name: { $in: categories.map((c) => c.toLowerCase()) },
  }).select("_id");

  // Trova i generi in base ai nomi
  const genreIds = await Genre.find({
    name: { $in: genres.map((g) => g.toLowerCase()) },
  }).select("_id");

  // Trova i topic in base ai nomi
  const topicIds = await Topic.find({
    name: { $in: topics.map((t) => t.toLowerCase()) },
  }).select("_id");

  console.log("🔹 ID trovati:", {
    categoryIds,
    genreIds,
    topicIds,
  });

  return {
    categoryIds: categoryIds.map((cat) => cat._id),
    genreIds: genreIds.map((gen) => gen._id),
    topicIds: topicIds.map((top) => top._id),
  };
}
