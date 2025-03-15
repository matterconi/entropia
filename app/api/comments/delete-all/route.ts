import { NextRequest, NextResponse } from "next/server";

import Article from "@/database/Article";
import Comments from "@/database/Comments";
import dbConnect from "@/lib/mongoose";

/**
 * DELETE per eliminare tutti i commenti di tutti i post.
 * Attenzione: Questo endpoint è potente e andrebbe protetto (ad es. solo admin).
 */
export async function DELETE(req: NextRequest) {
  await dbConnect();
  try {
    // Elimina tutti i documenti della collezione Comments
    const deleteResult = await Comments.deleteMany({});

    // Se il modello Article tiene traccia dei commenti, svuota questo campo per tutti gli articoli
    const updatedArticles = await Article.updateMany(
      {},
      { $set: { comments: [] } },
    );

    return NextResponse.json(
      {
        message: "Tutti i commenti sono stati eliminati.",
        deleteResult,
        updatedArticles,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Errore durante DELETE_ALL /api/comments/delete-all:", error);
    return NextResponse.json(
      { error: "Errore sul server", message: error.message },
      { status: 500 },
    );
  }
}
