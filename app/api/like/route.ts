// app/api/like/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import PostLike from "@/database/PostLike";
import User from "@/database/User";
import Article from "@/database/Article";

/**
 * GET per recuperare i like
 * - Se viene passato solo "user": ritorna tutti i post piaciuti dall’utente.
 * - Se vengono passati "user" e "post": ritorna un booleano che indica se l’utente ha messo like a quel post.
 */
export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const user = searchParams.get("user");
    const post = searchParams.get("post");
    console.log("user:", user);
    if (!user) {
      return NextResponse.json(
        { error: "User id obbligatorio" },
        { status: 400 }
      );
    }

    if (post) {
      const foundLike = await PostLike.findOne({ user, post });
      return NextResponse.json({ liked: Boolean(foundLike) }, { status: 200 });
    } else {
      const foundUser = await User.findById(user).populate("likedPosts");
      if (!foundUser) {
        return NextResponse.json(
          { error: "Utente non trovato" },
          { status: 404 }
        );
      }
      return NextResponse.json({ likedPosts: foundUser.likedPosts }, { status: 200 });
    }
  } catch (error: any) {
    console.error("Errore durante GET /api/like:", error);
    return NextResponse.json(
      { error: "Errore sul server", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST per aggiungere un like
 * - Riceve "user" e "post" nel body della richiesta.
 * - Verifica che l’utente non abbia già messo like a quel post, altrimenti restituisce un errore.
 * - Crea il nuovo like, aggiorna l'array likedPosts dell'utente e incrementa il likeCount dell'articolo.
 */
export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    const { user, post } = body;

    if (!user || !post) {
      return NextResponse.json(
        { error: "User e post sono obbligatori" },
        { status: 400 }
      );
    }

    const existingLike = await PostLike.findOne({ user, post });
    if (existingLike) {
      return NextResponse.json(
        { error: "L'utente ha già messo like a questo post" },
        { status: 400 }
      );
    }

    const newLike = await PostLike.create({ user, post });
    await User.findByIdAndUpdate(user, { $addToSet: { likedPosts: post } });

    // Incrementa il likeCount dell'articolo
    const updatedArticle = await Article.findByIdAndUpdate(
      post,
      { $inc: { likeCount: 1 } },
      { new: true }
    );

    return NextResponse.json(
      { like: newLike, likeCount: updatedArticle?.likeCount },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Errore durante POST /api/like:", error);
    return NextResponse.json(
      { error: "Errore sul server", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE per rimuovere un like
 * - Riceve "user" e "post" nel body della richiesta.
 * - Verifica che l’utente abbia messo like a quel post.
 * - Rimuove il like, elimina il riferimento nell'array likedPosts dell'utente
 *   e decrementa il likeCount dell'articolo.
 */
export async function DELETE(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    const { user, post } = body;

    if (!user || !post) {
      return NextResponse.json(
        { error: "User e post sono obbligatori" },
        { status: 400 }
      );
    }

    const existingLike = await PostLike.findOne({ user, post });
    if (!existingLike) {
      return NextResponse.json(
        { error: "L'utente non ha messo like a questo post" },
        { status: 400 }
      );
    }

    await PostLike.deleteOne({ user, post });
    await User.findByIdAndUpdate(user, { $pull: { likedPosts: post } });

    // Decrementa il likeCount dell'articolo
    const updatedArticle = await Article.findByIdAndUpdate(
      post,
      { $inc: { likeCount: -1 } },
      { new: true }
    );

    return NextResponse.json(
      { message: "Like rimosso", likeCount: updatedArticle?.likeCount },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Errore durante DELETE /api/like:", error);
    return NextResponse.json(
      { error: "Errore sul server", message: error.message },
      { status: 500 }
    );
  }
}
