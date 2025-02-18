import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import Article from "@/database/Article";
import Category from "@/database/Category";
import Genre from "@/database/Genre";
import Topic from "@/database/Topic";
import User from "@/database/User";
import dbConnect from "@/lib/mongoose";

// ✅ Definizione dell'interfaccia TypeScript per il documento dell'articolo
interface IArticle {
  _id: string;
  title: string;
  markdownPath: string;
  author: { username: string };
  categories: { name: string }[];
  genres: { name: string }[];
  topics: { name: string }[];
  createdAt: Date;
}

interface Params {
  params: { id: string };
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  await dbConnect();

  try {
    // Recupera l'articolo e tipizzalo come IArticle
    const article = (await Article.findById(id)
      .populate<{ author: { username: string } }>("author", "username")
      .populate<{ categories: { name: string }[] }>("categories", "name")
      .populate<{ genres: { name: string }[] }>("genres", "name")
      .populate<{ topics: { name: string }[] }>("topics", "name")
      .lean()) as IArticle | null;

    if (!article) {
      console.error("❌ Articolo non trovato!");
      return new NextResponse(
        JSON.stringify({ message: "Articolo non trovato" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    console.log("✅ Articolo trovato:", article.title);

    // Scarica il file Markdown da Supabase
    console.log("📥 Scaricando Markdown da:", article.markdownPath);
    const { data, error } = await supabase.storage
      .from("articles-content")
      .download(article.markdownPath);

    if (error) {
      console.error("❌ Errore nel recupero del Markdown:", error.message);
      return new NextResponse(
        JSON.stringify({
          message: "Errore nel recupero del file Markdown",
          error: error.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    console.log("✅ Markdown scaricato con successo");
    const markdownText = await data.text();

    return new NextResponse(
      JSON.stringify({
        message: "API funzionante",
        article,
        markdownContent: markdownText,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    console.error("❌ Errore API GET:", error);
    return new NextResponse(
      JSON.stringify({
        message: "Errore nel recupero dell'articolo",
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Aspetta la risoluzione della Promise per ottenere i parametri
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: "ID non fornito" }, { status: 400 });
    }

    const result = await Article.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json(
        { message: "Articolo non trovato" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: "Articolo eliminato con successo",
        deletedArticle: result,
      },
      { status: 200 },
    );
  } catch (error) {
    let errorMessage = "Errore sconosciuto";

    if (error instanceof Error) {
      errorMessage = error.message; // ✅ TypeScript ora riconosce l'errore
    }

    return NextResponse.json(
      {
        message: "Errore durante la cancellazione",
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
