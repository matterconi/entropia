// app/api/debug/user-role/route.ts
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

import User from "@/database/User";
import dbConnect from "@/lib/mongoose";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        {
          error: "Email parameter required",
        },
        { status: 400 },
      );
    }

    // 1. Prima stampiamo lo schema attuale di User per diagnostica
    console.log("Schema corrente di User:", User.schema.paths);

    // 2. Verifichiamo se i campi necessari esistono nello schema
    const hasRoleField = !!User.schema.paths.role;
    const hasAdminProfileField = !!User.schema.paths.adminProfile;
    const hasEditorProfileField = !!User.schema.paths.editorProfile;
    const hasAuthorProfileField = !!User.schema.paths.authorProfile;

    // 3. Se i campi mancano, dobbiamo aggiornare lo schema direttamente
    // Nota: in produzione sarebbe meglio aggiornare il file dello schema originale
    if (
      !hasRoleField ||
      !hasAdminProfileField ||
      !hasEditorProfileField ||
      !hasAuthorProfileField
    ) {
      console.log("🔄 Aggiornamento schema User con campi mancanti...");

      // Aggiungiamo i campi mancanti
      if (!hasRoleField) {
        User.schema.add({ role: { type: String, default: "user" } });
      }
      if (!hasAdminProfileField) {
        User.schema.add({
          adminProfile: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
        });
      }
      if (!hasEditorProfileField) {
        User.schema.add({
          editorProfile: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Editor",
          },
        });
      }
      if (!hasAuthorProfileField) {
        User.schema.add({
          authorProfile: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AuthorProfile",
          },
        });
      }

      console.log("✅ Schema aggiornato!");
    }

    // 4. Aggiorniamo solo l'utente specifico
    const updatedUser = await User.findOneAndUpdate(
      { email },
      [
        {
          $set: {
            role: "user", // Valore di default
            // Imposta i profili a null solo se non sono già definiti
            adminProfile: {
              $cond: [
                { $ifNull: ["$adminProfile", false] },
                "$adminProfile",
                null,
              ],
            },
            editorProfile: {
              $cond: [
                { $ifNull: ["$editorProfile", false] },
                "$editorProfile",
                null,
              ],
            },
            authorProfile: {
              $cond: [
                { $ifNull: ["$authorProfile", false] },
                "$authorProfile",
                null,
              ],
            },
          },
        },
      ],
      { new: true, upsert: false }, // Restituisce il documento aggiornato
    );

    if (!updatedUser) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        { status: 404 },
      );
    }

    // 5. Verifichiamo l'aggiornamento
    return NextResponse.json({
      message: "User details updated and retrieved",
      user: updatedUser,
      schema: {
        hasRoleField,
        hasAdminProfileField,
        hasEditorProfileField,
        hasAuthorProfileField,
      },
      allFields: Object.keys(updatedUser.toObject()),
    });
  } catch (error: any) {
    console.error("Error in diagnostic endpoint:", error);
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 },
    );
  }
}
