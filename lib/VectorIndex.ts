// File: database/vectorIndex.ts

import mongoose from "mongoose";

import Article from "./Article";

/**
 * Configura un indice vettoriale in MongoDB per gli embedding degli articoli
 * Richiede MongoDB 6.0+ con Atlas o configurazione compatibile
 */
export async function setupVectorIndex() {
  try {
    // Verifica se la collezione degli articoli ha già un indice vettoriale
    const collection = mongoose.connection.db.collection("articles");
    const indexes = await collection.indexes();

    const hasVectorIndex = indexes.some(
      (index) => index.name === "embedding_vector_index",
    );

    if (!hasVectorIndex) {
      console.log("Creating vector index on embedding field...");

      // Crea un indice vettoriale sulla collezione degli articoli
      await collection.createIndex(
        { embedding: "vector" },
        {
          name: "embedding_vector_index",
          vectorSize: 1024, // Dimensione del vettore (adatta al tuo modello specifico)
          vectorDistanceMetric: "cosine", // Usa distanza coseno
        },
      );

      console.log("Vector index created successfully");
    } else {
      console.log("Vector index already exists");
    }
  } catch (error) {
    console.error("Error setting up vector index:", error);
    throw error;
  }
}

/**
 * Cerca gli articoli simili usando il vector search di MongoDB
 * @param embedding - Vettore embedding di riferimento
 * @param limit - Numero massimo di risultati
 * @param excludeIds - Array di IDs da escludere dalla ricerca
 * @returns Array di articoli simili con punteggio
 */
export async function findSimilarArticles(
  embedding: number[],
  limit: number = 8,
  excludeIds: mongoose.Types.ObjectId[] = [],
) {
  try {
    // Crea la pipeline di aggregazione con $vectorSearch
    const pipeline = [
      {
        $vectorSearch: {
          index: "embedding_vector_index",
          queryVector: embedding,
          path: "embedding",
          numCandidates: limit * 10, // Considera un numero maggiore di candidati
          limit: limit + excludeIds.length + 10, // Aggiunge margine per gli ID esclusi
          similarity: "cosine",
        },
      },
      // Filtra gli ID esclusi
      {
        $match: {
          _id: { $nin: excludeIds },
        },
      },
      // Limita al numero richiesto
      { $limit: limit },
      // Seleziona i campi necessari
      {
        $project: {
          _id: 1,
          title: 1,
          coverImage: 1,
          author: 1,
          publicationDate: 1,
          categories: 1,
          genres: 1,
          topics: 1,
          isSeriesChapter: 1,
          series: 1,
          similarity: { $meta: "vectorSearchScore" },
        },
      },
    ];

    return await Article.aggregate(pipeline);
  } catch (error) {
    console.error("Error in vector search:", error);

    // Fallback alla cosine similarity manuale se vectorSearch non è disponibile
    console.log("Falling back to manual cosine similarity calculation");
    return manualCosineSimilaritySearch(embedding, limit, excludeIds);
  }
}

/**
 * Implementazione manuale della ricerca per similarità coseno
 * Da usare come fallback se vectorSearch non è disponibile
 */
async function manualCosineSimilaritySearch(
  embedding: number[],
  limit: number = 8,
  excludeIds: mongoose.Types.ObjectId[] = [],
) {
  // Implementazione come nella route.ts originale
  const excludeIdsObjects = excludeIds.map((id) =>
    typeof id === "string" ? new mongoose.Types.ObjectId(id) : id,
  );

  return await Article.aggregate([
    // Escludi gli articoli specificati
    { $match: { _id: { $nin: excludeIdsObjects } } },

    // Assicurati che gli articoli abbiano un embedding
    { $match: { embedding: { $exists: true, $ne: [] } } },

    // Calcola la similarità coseno
    {
      $addFields: {
        dotProduct: {
          $reduce: {
            input: { $zip: { inputs: ["$embedding", embedding] } },
            initialValue: 0,
            in: {
              $add: [
                "$$value",
                {
                  $multiply: [
                    { $arrayElemAt: ["$$this", 0] },
                    { $arrayElemAt: ["$$this", 1] },
                  ],
                },
              ],
            },
          },
        },
        normA: {
          $sqrt: {
            $reduce: {
              input: "$embedding",
              initialValue: 0,
              in: { $add: ["$$value", { $multiply: ["$$this", "$$this"] }] },
            },
          },
        },
        normB: {
          $sqrt: {
            $reduce: {
              input: embedding,
              initialValue: 0,
              in: { $add: ["$$value", { $multiply: ["$$this", "$$this"] }] },
            },
          },
        },
      },
    },

    // Calcola il valore finale della similarità coseno
    {
      $addFields: {
        similarity: {
          $cond: [
            { $or: [{ $eq: ["$normA", 0] }, { $eq: ["$normB", 0] }] },
            0,
            { $divide: ["$dotProduct", { $multiply: ["$normA", "$normB"] }] },
          ],
        },
      },
    },

    // Ordina per similarità decrescente
    { $sort: { similarity: -1 } },

    // Limita ai risultati richiesti
    { $limit: limit },

    // Proietta i campi necessari
    {
      $project: {
        _id: 1,
        title: 1,
        coverImage: 1,
        author: 1,
        publicationDate: 1,
        categories: 1,
        genres: 1,
        topics: 1,
        isSeriesChapter: 1,
        series: 1,
        similarity: 1,
      },
    },
  ]);
}
