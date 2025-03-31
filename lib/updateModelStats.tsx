import mongoose from "mongoose";

import Article from "@/database/Article";
import Category from "@/database/Category";
import Genre from "@/database/Genre";
import Topic from "@/database/Topic";

/**
 * Aggiorna incrementalmente le statistiche quando viene inserito un nuovo articolo
 * Ispirato a recalculateCounters() ma ottimizzato per aggiornamenti singoli
 *
 * @param {string} articleId - L'ID dell'articolo appena inserito
 * @returns {Promise<Object>} - Risultato dell'operazione
 */
/**
 * Aggiorna incrementalmente le statistiche quando viene inserito un nuovo articolo
 * Ispirato a recalculateCounters() ma ottimizzato per aggiornamenti singoli
 *
 * @param {string} articleId - L'ID dell'articolo appena inserito
 * @returns {Promise<Object>} - Risultato dell'operazione
 */
export async function updateModelStats(articleId) {
  try {
    console.log(`🔄 Aggiornamento statistiche per l'articolo: ${articleId}`);

    // Recupera l'articolo con tutte le relazioni necessarie
    const article = await Article.findById(articleId)
      .populate("categories")
      .populate({
        path: "genres.id", // Correggi il percorso per accedere correttamente al campo 'id' degli oggetti nel campo 'genres'
        select: "_id name",
      })
      .populate({
        path: "topics.id", // Correggi il percorso per accedere correttamente al campo 'id' degli oggetti nel campo 'topics'
        select: "_id name",
      })
      .populate("author", "_id name")
      .lean();

    if (!article) {
      console.warn(`⚠️ Articolo non trovato: ${articleId}`);
      return {
        success: false,
        message: "Articolo non trovato",
      };
    }

    // Log per debug
    console.log(`📄 Elaborazione articolo: ${article.title || articleId}`);

    // Estrai correttamente gli ID delle entità correlate
    const categoryIds = ensureValidArray(article.categories).map((cat) =>
      mongoose.Types.ObjectId.isValid(cat._id) ? cat._id : cat,
    );

    // Estrai ID dai generi (gestendo la struttura con id e relevance)
    const genres = ensureValidArray(article.genres).map((genre) => {
      // I generi sono memorizzati nel formato {id: ObjectId, relevance: Number}
      const genreObj = genre.id || {}; // Accedi all'oggetto popolato tramite il campo id
      const genreId = genre.id?._id || genre.id;
      const genreName = genreObj.name || ""; // Ottieni il nome dall'oggetto popolato

      console.log(`📊 Genere: ID=${genreId}, Nome=${genreName}`);
      return { id: genreId, name: genreName };
    });

    // Estrai ID dai topic (gestendo la struttura con id e relevance)
    const topics = ensureValidArray(article.topics).map((topic) => {
      // I topic sono memorizzati nel formato {id: ObjectId, relevance: Number}
      const topicObj = topic.id || {}; // Accedi all'oggetto popolato tramite il campo id
      const topicId = topic.id?._id || topic.id;
      const topicName = topicObj.name || ""; // Ottieni il nome dall'oggetto popolato

      console.log(`📊 Topic: ID=${topicId}, Nome=${topicName}`);
      return { id: topicId, name: topicName };
    });

    // Estrai ID e nome dell'autore
    const authorId = article.author?._id || article.author;
    const authorName = article.author?.name || "Sconosciuto";

    // Aggiungi operazioni in parallelo per migliorare le prestazioni
    const updatePromises = [];

    // 1. Aggiorna categorie
    for (const categoryId of categoryIds) {
      // Incrementa totalArticles per ogni categoria
      updatePromises.push(
        Category.updateOne({ _id: categoryId }, { $inc: { totalArticles: 1 } }),
      );

      // Aggiorna genreCounts per ogni categoria
      for (const genre of genres) {
        updatePromises.push(
          updateCountItem(
            Category,
            categoryId,
            "genreCounts",
            genre.id,
            genre.name,
          ),
        );
      }

      // Aggiorna topicCounts per ogni categoria
      for (const topic of topics) {
        updatePromises.push(
          updateCountItem(
            Category,
            categoryId,
            "topicCounts",
            topic.id,
            topic.name,
          ),
        );
      }

      // Aggiorna authorCounts per ogni categoria
      if (authorId) {
        updatePromises.push(
          updateCountItem(
            Category,
            categoryId,
            "authorCounts",
            authorId,
            authorName,
          ),
        );
      }
    }

    // 2. Aggiorna generi
    for (const genre of genres) {
      // Incrementa totalArticles per ogni genere
      updatePromises.push(
        Genre.updateOne({ _id: genre.id }, { $inc: { totalArticles: 1 } }),
      );

      // Aggiorna categoryCounts per ogni genere
      for (const categoryId of categoryIds) {
        const categoryName = getCategoryName(article.categories, categoryId);
        updatePromises.push(
          updateCountItem(
            Genre,
            genre.id,
            "categoryCounts",
            categoryId,
            categoryName,
          ),
        );
      }

      // Aggiorna topicCounts per ogni genere
      for (const topic of topics) {
        updatePromises.push(
          updateCountItem(Genre, genre.id, "topicCounts", topic.id, topic.name),
        );
      }

      // Aggiorna authorCounts per ogni genere
      if (authorId) {
        updatePromises.push(
          updateCountItem(
            Genre,
            genre.id,
            "authorCounts",
            authorId,
            authorName,
          ),
        );
      }
    }

    // 3. Aggiorna topic
    for (const topic of topics) {
      // Incrementa totalArticles per ogni topic
      updatePromises.push(
        Topic.updateOne({ _id: topic.id }, { $inc: { totalArticles: 1 } }),
      );

      // Aggiorna categoryCounts per ogni topic
      for (const categoryId of categoryIds) {
        const categoryName = getCategoryName(article.categories, categoryId);
        updatePromises.push(
          updateCountItem(
            Topic,
            topic.id,
            "categoryCounts",
            categoryId,
            categoryName,
          ),
        );
      }

      // Aggiorna genreCounts per ogni topic
      for (const genre of genres) {
        updatePromises.push(
          updateCountItem(Topic, topic.id, "genreCounts", genre.id, genre.name),
        );
      }

      // Aggiorna authorCounts per ogni topic
      if (authorId) {
        updatePromises.push(
          updateCountItem(
            Topic,
            topic.id,
            "authorCounts",
            authorId,
            authorName,
          ),
        );
      }
    }

    // Attendi il completamento di tutte le operazioni
    await Promise.all(updatePromises);

    console.log(`✅ Statistiche aggiornate per l'articolo ${articleId}`);
    return {
      success: true,
      message: "Statistiche aggiornate con successo",
      updates: updatePromises.length,
    };
  } catch (error) {
    console.error("❌ Errore nell'aggiornamento delle statistiche:", error);
    return {
      success: false,
      message: `Errore nell'aggiornamento: ${error.message || error}`,
    };
  }
}

/**
 * Funzione helper per aggiornare un elemento di conteggio
 */
async function updateCountItem(Model, entityId, countField, itemId, itemName) {
  try {
    // Se il nome è vuoto, cerca di recuperarlo dal database
    let finalName = itemName;

    if (!finalName || finalName === "" || finalName === "Sconosciuto") {
      console.log(`🔍 Nome mancante per ${countField}, cerco nel database...`);

      // Determina il modello da usare in base al campo di conteggio
      let ItemModel;
      if (countField === "genreCounts") {
        ItemModel = Genre;
      } else if (countField === "topicCounts") {
        ItemModel = Topic;
      } else if (countField === "categoryCounts") {
        ItemModel = Category;
      }

      // Se abbiamo un modello valido, cerca l'entità nel database
      if (ItemModel && itemId) {
        try {
          const entity = await ItemModel.findById(itemId).select("name").lean();
          if (entity && entity.name) {
            finalName = entity.name;
            console.log(`✅ Nome recuperato dal database: ${finalName}`);
          }
        } catch (lookupError) {
          console.error(
            `❌ Errore nel recupero del nome per ${itemId}:`,
            lookupError,
          );
        }
      }

      // Se ancora non abbiamo un nome, usa un valore di default
      if (!finalName || finalName === "") {
        finalName =
          countField === "genreCounts"
            ? "genere"
            : countField === "topicCounts"
              ? "topic"
              : countField === "categoryCounts"
                ? "categoria"
                : countField === "authorCounts"
                  ? "autore"
                  : "elemento";
      }
    }

    // Prima prova ad aggiornare se l'elemento esiste già
    const result = await Model.updateOne(
      {
        _id: entityId,
        [`${countField}.id`]: itemId,
      },
      {
        $inc: { [`${countField}.$.count`]: 1 },
      },
    );

    // Se non esiste, aggiungi un nuovo elemento
    if (result.matchedCount === 0) {
      console.log(
        `➕ Aggiungo nuovo elemento in ${countField}: ${finalName} (ID: ${itemId})`,
      );
      return Model.updateOne(
        { _id: entityId },
        {
          $push: {
            [countField]: {
              id: itemId,
              name: finalName,
              count: 1,
            },
          },
        },
      );
    }

    return result;
  } catch (error) {
    console.error(`❌ Errore nell'aggiornamento di ${countField}:`, error);
    throw error;
  }
}

/**
 * Funzione helper per estrarre l'ID da un'entità
 */
function extractId(entity) {
  if (!entity) return null;

  // Se è un oggetto complesso con id o _id
  if (typeof entity === "object") {
    if (entity.id) return entity.id;
    if (entity._id) return entity._id;
  }

  // Se è un ObjectId o una stringa
  return entity;
}

/**
 * Funzione helper per estrarre il nome da un'entità
 */
function extractName(entity) {
  if (!entity) return "";

  // Se è un oggetto complesso con name
  if (typeof entity === "object") {
    // Cerca il nome in vari livelli dell'oggetto
    if (entity.name) return entity.name;
    if (entity.id && entity.id.name) return entity.id.name;

    // Prova a cercare il nome usando l'ID
    if (entity._id || entity.id) {
      const id = entity._id || entity.id;
      // Qui potremmo fare una query al database per ottenere il nome, ma per ora restituiamo un valore vuoto
    }
  }

  return "";
}

/**
 * Funzione helper per ottenere il nome di una categoria dato l'ID
 */
function getCategoryName(categories, categoryId) {
  if (!categories || !categoryId) return "Sconosciuto";

  const category = categories.find((cat) => {
    const catId = cat._id ? cat._id.toString() : cat.toString();
    const searchId = categoryId.toString();
    return catId === searchId;
  });

  return category?.name || "Sconosciuto";
}

/**
 * Assicura che l'input sia un array valido
 */
function ensureValidArray(input) {
  if (!input) return [];
  if (!Array.isArray(input)) return [input];
  return input;
}

export default updateModelStats;
