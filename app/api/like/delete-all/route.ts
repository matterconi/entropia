// app/api/like/delete-all/route.ts

import { NextRequest, NextResponse } from "next/server";

import Article from "@/database/Article";
import PostLike from "@/database/PostLike";
import User from "@/database/User";
import dbConnect from "@/lib/mongoose";

/**
 * DELETE per eliminare TUTTI i like ai post.
 * Attenzione: Questo endpoint è molto potente e dovrebbe essere protetto (ad es. accessibile solo ad admin).
 */
export async function DELETE(req: NextRequest) {
  await dbConnect();
  try {
    // Elimina tutti i documenti nella collezione PostLike
    const deleteResult = await PostLike.deleteMany({});

    // Aggiorna tutti i documenti User rimuovendo ogni riferimento ai like
    const updatedUsers = await User.updateMany(
      {},
      { $set: { likedPosts: [] } },
    );

    // Aggiorna tutti gli articoli impostando likeCount a zero
    const updatedArticles = await Article.updateMany(
      {},
      { $set: { likeCount: 0 } },
    );

    return NextResponse.json(
      {
        message: "Tutti i like sono stati eliminati.",
        deleteResult,
        updatedUsers,
        updatedArticles,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Errore durante DELETE_ALL /api/like/delete-all:", error);
    return NextResponse.json(
      { error: "Errore sul server", message: error.message },
      { status: 500 },
    );
  }
}
