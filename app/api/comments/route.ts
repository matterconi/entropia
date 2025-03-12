// app/api/comments/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Comments from "@/database/Comments"; // Modello che gestisce il documento dei commenti per un post

/**
 * GET per recuperare i commenti
 * - Richiede il parametro "post" (obbligatorio)
 * - Supporta paginazione tramite "skip" e "limit" (default limit = 5)
 * - Se viene passato anche "user", per ogni commento viene aggiunto il flag "isOwner" che indica se appartiene all'utente
 */
export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const post = searchParams.get("post");
    const user = searchParams.get("user");

    if (!post) {
      return NextResponse.json(
        { error: "Post id obbligatorio" },
        { status: 400 }
      );
    }

    // Imposta i parametri di paginazione
    const skip = Number(searchParams.get("skip")) || 0;
    const limit = Number(searchParams.get("limit")) || 5;

    // Recupera il documento dei commenti per il post usando l'operatore $slice per la paginazione
    const commentsDoc = await Comments.findOne({ post }, { comments: { $slice: [skip, limit] } })
      .populate("comments.user", "username profileImg");
      
    if (!commentsDoc) {
        return NextResponse.json({ comments: [] }, { status: 200 });
    }

    // Se viene passato "user", aggiunge un flag isOwner ad ogni commento
    let allComments = commentsDoc.comments;
    if (user) {
        allComments = commentsDoc.comments.map((comment: any) => { // Add type annotation to 'comment'
            const commentObj = typeof comment.toObject === "function" ? comment.toObject() : comment;
            commentObj.isOwner = commentObj.user && commentObj.user._id.toString() === user;
            return commentObj;
        });
    }

    return NextResponse.json({ comments: allComments }, { status: 200 });
  } catch (error: any) {
    console.error("Errore durante GET /api/comments:", error);
    return NextResponse.json(
      { error: "Errore sul server", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST per aggiungere un commento
 * - Riceve nel body: user, post, content e opzionalmente parentComment (per risposte)
 * - Se non esiste un documento Comments per il post, lo crea; altrimenti, aggiunge il commento all'array.
 */
export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    const { user, post, content, parentComment } = body;

    if (!user || !post || !content) {
      return NextResponse.json(
        { error: "User, post e content sono obbligatori" },
        { status: 400 }
      );
    }

    // Crea il nuovo commento
    const newComment = {
      user,
      content,
      parentComment: parentComment || null,
      createdAt: new Date()
    };

    // Cerca il documento dei commenti per il post
    let commentsDoc = await Comments.findOne({ post });
    if (!commentsDoc) {
      // Se non esiste, crealo con il nuovo commento
      commentsDoc = await Comments.create({ post, comments: [newComment] });
    } else {
      // Altrimenti, aggiungi il commento all'array e salva
      commentsDoc.comments.push(newComment);
      await commentsDoc.save();
    }

    return NextResponse.json(
      { message: "Comment added", comment: newComment, comments: commentsDoc.comments },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Errore durante POST /api/comments:", error);
    return NextResponse.json(
      { error: "Errore sul server", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE per rimuovere un commento
 * - Riceve nel body: user, post e commentId
 * - Rimuove il commento solo se appartiene all'utente (per garantire l'autorizzazione)
 */
export async function DELETE(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    const { user, post, commentId } = body;

    if (!user || !post || !commentId) {
      return NextResponse.json(
        { error: "User, post e commentId sono obbligatori" },
        { status: 400 }
      );
    }

    // Rimuove il commento che corrisponde a commentId e appartiene all'utente
    const updateResult = await Comments.updateOne(
      { post },
      { $pull: { comments: { _id: commentId, user: user } } }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Comment non trovato o non autorizzato" },
        { status: 400 }
      );
    }

    const commentsDoc = await Comments.findOne({ post });
    return NextResponse.json(
      { message: "Comment removed", comments: commentsDoc ? commentsDoc.comments : [] },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Errore durante DELETE /api/comments:", error);
    return NextResponse.json(
      { error: "Errore sul server", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT per modificare un commento
 * - Riceve nel body: user, post, commentId e il nuovo content
 * - Aggiorna il commento solo se appartiene all'utente
 */
export async function PUT(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    const { user, post, commentId, content } = body;

    if (!user || !post || !commentId || !content) {
      return NextResponse.json(
        { error: "User, post, commentId e content sono obbligatori" },
        { status: 400 }
      );
    }

    // Aggiorna il commento usando arrayFilters per individuare l'elemento corretto
    const updateResult = await Comments.updateOne(
      { post },
      { $set: { "comments.$[elem].content": content } },
      { arrayFilters: [{ "elem._id": commentId, "elem.user": user }] }
    );

    if (updateResult.modifiedCount === 0) {
        return NextResponse.json(
            { error: "Comment non trovato o non autorizzato" },
            { status: 400 }
        );
    }

    const commentsDoc = await Comments.findOne({ post });
    const updatedComment = commentsDoc?.comments.find(
        (comment: any) => comment._id.toString() === commentId
    );

    return NextResponse.json(
      { message: "Comment updated", comment: updatedComment },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Errore durante PUT /api/comments:", error);
    return NextResponse.json(
      { error: "Errore sul server", message: error.message },
      { status: 500 }
    );
  }
}
