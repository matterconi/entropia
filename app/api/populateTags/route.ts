import { NextResponse } from "next/server";

import { categories, genres, topic } from "@/data/data";
import Category from "@/database/Category";
import Genre from "@/database/Genre";
import Topic from "@/database/Topic";
import dbConnect from "@/lib/mongoose";

export async function GET() {
  await dbConnect();

  try {
    console.log("🔹 Popolamento del database...");

    // Popola i generi
    for (const { title } of genres) {
      const existing = await Genre.findOne({ name: title }); // ✅ Cerca per `name`
      if (!existing) {
        await Genre.create({ name: title }); // ✅ Salva con `name`
      }
    }

    // Popola le categorie
    for (const { title } of categories) {
      const existing = await Category.findOne({ name: title }); // ✅ Cerca per `name`
      if (!existing) {
        await Category.create({ name: title }); // ✅ Salva con `name`
      }
    }

    // Popola i topics
    for (const { title } of topic) {
      const existing = await Topic.findOne({ name: title }); // ✅ Cerca per `name`
      if (!existing) {
        await Topic.create({ name: title }); // ✅ Salva con `name`
      }
    }

    console.log("✅ Popolamento completato con successo!");
    return NextResponse.json(
      { message: "Database popolato con successo!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Errore durante il popolamento:", error);
    return NextResponse.json(
      { error: "Errore nel popolamento del database" },
      { status: 500 },
    );
  }
}
