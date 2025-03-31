// File: app/api/recommendations/diagnose/route.ts
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

import Article from "@/database/Article";
import connectDB from "@/lib/mongoose";

/**
 * GET /api/recommendations/diagnose
 * API di diagnostica per identificare il problema con il vector index
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Connetti al database
    await connectDB();

    const diagnosticInfo: any = {
      stage: "init",
      error: null,
      databaseInfo: {},
      articleInfo: {},
      vectorInfo: {},
      indexInfo: {},
      randomArticlesTest: {},
    };

    // 1. Verifica la connessione al database
    try {
      diagnosticInfo.stage = "database-check";
      diagnosticInfo.databaseInfo.connected = true;
      diagnosticInfo.databaseInfo.mongodb = mongoose.connection.db.databaseName;

      // Ottieni informazioni sulla versione del database
      const adminDb = mongoose.connection.db.admin();
      const serverInfo = await adminDb.serverInfo();
      diagnosticInfo.databaseInfo.version = serverInfo.version;

      // Controlla se Atlas o altro
      const buildInfo = await adminDb.buildInfo();
      diagnosticInfo.databaseInfo.isAtlas =
        buildInfo.modules?.includes("enterprise");
    } catch (dbError) {
      diagnosticInfo.databaseInfo.error = dbError.message;
    }

    // 2. Verifica articoli totali nel database
    try {
      diagnosticInfo.stage = "article-count";
      const totalArticles = await Article.countDocuments();
      const publishedArticles = await Article.countDocuments({
        isPublished: true,
      });

      diagnosticInfo.articleInfo.total = totalArticles;
      diagnosticInfo.articleInfo.published = publishedArticles;

      // Controlla quanti articoli hanno embedding
      const articlesWithEmbedding = await Article.countDocuments({
        embedding: { $exists: true, $ne: null, $not: { $size: 0 } },
      });

      diagnosticInfo.articleInfo.withEmbedding = articlesWithEmbedding;

      // Ottieni dimensioni di un embedding esempio
      const sampleArticle = await Article.findOne({
        embedding: { $exists: true, $ne: null, $not: { $size: 0 } },
      }).select("embedding");

      if (sampleArticle && sampleArticle.embedding) {
        diagnosticInfo.vectorInfo.dimensions = sampleArticle.embedding.length;
        diagnosticInfo.vectorInfo.sampleValues = sampleArticle.embedding.slice(
          0,
          3,
        );
      } else {
        diagnosticInfo.vectorInfo.error = "No article with embedding found";
      }
    } catch (articleError) {
      diagnosticInfo.articleInfo.error = articleError.message;
    }

    // 3. Verifica indici definiti
    try {
      diagnosticInfo.stage = "index-check";
      const indexes = await Article.collection.indexes();

      // Filtra per trovare eventuali indici vettoriali
      const vectorIndexes = indexes.filter(
        (idx) =>
          idx.name.includes("vector") ||
          (idx.key && Object.keys(idx.key).some((k) => k === "embedding")),
      );

      diagnosticInfo.indexInfo.total = indexes.length;
      diagnosticInfo.indexInfo.vectorIndexes = vectorIndexes;
    } catch (indexError) {
      diagnosticInfo.indexInfo.error = indexError.message;
    }

    // 4. Test di ricerca random
    try {
      diagnosticInfo.stage = "random-test";

      // Tenta di recuperare alcuni articoli casuali
      const randomArticles = await Article.aggregate([
        { $match: { isPublished: true } },
        { $sample: { size: 3 } },
        { $project: { _id: 1, title: 1 } },
      ]);

      diagnosticInfo.randomArticlesTest.success = randomArticles.length > 0;
      diagnosticInfo.randomArticlesTest.count = randomArticles.length;
      diagnosticInfo.randomArticlesTest.sample = randomArticles;
    } catch (randomError) {
      diagnosticInfo.randomArticlesTest.error = randomError.message;
    }

    // 5. Test esplicito di vector search
    try {
      diagnosticInfo.stage = "vector-search-test";

      // Ottieni un articolo con embedding
      const testArticle = await Article.findOne({
        embedding: { $exists: true, $ne: null, $not: { $size: 0 } },
      }).select("_id embedding");

      if (testArticle && testArticle.embedding) {
        try {
          // Tenta una ricerca vettoriale di base
          const vectorResults = await Article.aggregate([
            {
              $vectorSearch: {
                index: "vector_index",
                path: "embedding",
                queryVector: testArticle.embedding,
                numCandidates: 10,
                limit: 5,
              },
            },
            {
              $project: {
                _id: 1,
                title: 1,
                similarity: { $meta: "vectorSearchScore" },
              },
            },
          ]);

          diagnosticInfo.vectorInfo.searchTest = {
            success: vectorResults && vectorResults.length > 0,
            results: vectorResults.length,
            sample: vectorResults.slice(0, 2),
          };
        } catch (vectorError) {
          diagnosticInfo.vectorInfo.searchTest = {
            success: false,
            error: vectorError.message,
            code: vectorError.code,
            name: vectorError.name,
            fullError: JSON.stringify(vectorError),
          };
        }
      }
    } catch (testError) {
      diagnosticInfo.vectorInfo.testError = testError.message;
    }

    diagnosticInfo.stage = "complete";
    return NextResponse.json(diagnosticInfo);
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message,
        stage: "failed",
      },
      { status: 500 },
    );
  }
}
