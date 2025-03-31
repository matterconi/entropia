import { NextResponse } from "next/server";

import Article from "@/database/Article";
import Category from "@/database/Category"; // Aggiungiamo l'import del modello Category
import Genre from "@/database/Genre";
import Topic from "@/database/Topic";
import dbConnect from "@/lib/mongoose";

export async function DELETE() {
  try {
    await dbConnect(); // Connessione al database

    // Eliminiamo tutti gli articoli, generi, topic e categorie
    const articleResult = await Article.deleteMany({});
    const genreResult = await Genre.deleteMany({});
    const topicResult = await Topic.deleteMany({});
    const categoryResult = await Category.deleteMany({}); // Aggiungiamo l'eliminazione delle categorie

    return NextResponse.json(
      {
        message: "Database resettato con successo",
        deleted: {
          articles: articleResult.deletedCount,
          genres: genreResult.deletedCount,
          topics: topicResult.deletedCount,
          categories: categoryResult.deletedCount, // Aggiungiamo il conteggio delle categorie eliminate
        },
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
        message: "Errore durante il reset del database",
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
