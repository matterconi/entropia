import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE!,
);

const BUCKET_NAME = "articles-content"; // Nome del bucket Supabase

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const articleId = formData.get("articleId") as string | null;

    if (!file || !articleId) {
      return NextResponse.json(
        { error: "File and articleId are required" },
        { status: 400 },
      );
    }

    const filePath = `${articleId}.md`; // Percorso file nel bucket

    // Converti File in ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Carica su Supabase Storage nel bucket specifico
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, arrayBuffer, {
        contentType: "text/markdown",
        upsert: false, // Non sovrascrivere file esistenti
      });

    if (error) {
      console.error("❌ Errore Upload:", error);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 },
      );
    }

    console.log("✅ File caricato:", data);
    return NextResponse.json(
      { message: "File uploaded successfully", filePath },
      { status: 201 },
    );
  } catch (error) {
    console.error("❌ Errore API Upload:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
