// app/api/setup/first-admin/route.ts
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

import User from "@/database/User";
import dbConnect from "@/lib/mongoose";

// Modelli per i vari profili
const getAdminModel = () => {
  return (
    mongoose.models.Admin ||
    mongoose.model(
      "Admin",
      new mongoose.Schema(
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          lastLogin: { type: Date, default: Date.now },
          permissions: { type: [String], default: ["all"] },
        },
        { timestamps: true },
      ),
    )
  );
};

const getEditorModel = () => {
  return (
    mongoose.models.Editor ||
    mongoose.model(
      "Editor",
      new mongoose.Schema(
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          assignedCategories: [
            { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
          ],
          stats: {
            articlesEdited: { type: Number, default: 0 },
            lastActivity: { type: Date, default: Date.now },
          },
        },
        { timestamps: true },
      ),
    )
  );
};

const getAuthorModel = () => {
  return (
    mongoose.models.AuthorProfile ||
    mongoose.model(
      "AuthorProfile",
      new mongoose.Schema(
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          bio: { type: String, default: "" },
          specialties: [String],
          stats: {
            articlesPublished: { type: Number, default: 0 },
            totalViews: { type: Number, default: 0 },
            lastPublished: { type: Date },
          },
        },
        { timestamps: true },
      ),
    )
  );
};

// Endpoint per creare il primo admin (da rimuovere dopo l'uso)
export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const { email } = await request.json();

    // Utilizza variabili d'ambiente per l'email autorizzata
    const AUTHORIZED_EMAIL = "matterconi@gmail.com";

    // Verifica che l'email sia quella autorizzata
    if (email !== AUTHORIZED_EMAIL) {
      return NextResponse.json(
        { message: "Email non autorizzata per questa operazione" },
        { status: 403 },
      );
    }

    // Trova l'utente usando Mongoose
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Aggiorna il ruolo a 'admin'
    user.role = "admin";

    // Inizializza i modelli per i vari profili
    const AdminModel = getAdminModel();
    const EditorModel = getEditorModel();
    const AuthorModel = getAuthorModel();

    // Crea i profili corrispondenti se non esistono già
    // 1. Profilo Admin
    if (!user.adminProfile) {
      const adminProfile = new AdminModel({
        user: user._id,
        lastLogin: new Date(),
        permissions: ["all"],
      });
      await adminProfile.save();
      user.adminProfile = adminProfile._id;
    }

    // 2. Profilo Editor (l'admin ha tutti i privilegi)
    if (!user.editorProfile) {
      const editorProfile = new EditorModel({
        user: user._id,
        assignedCategories: [], // Inizialmente vuoto
        stats: {
          articlesEdited: 0,
          lastActivity: new Date(),
        },
      });
      await editorProfile.save();
      user.editorProfile = editorProfile._id;
      console.log("✅ Profilo editor creato:", editorProfile._id);
    }

    // 3. Profilo Autore (gli admin possono anche creare contenuti)
    if (!user.authorProfile) {
      const authorProfile = new AuthorModel({
        user: user._id,
        bio: user.bio || "",
        specialties: [],
        stats: {
          articlesPublished: 0,
          totalViews: 0,
        },
      });
      await authorProfile.save();
      user.authorProfile = authorProfile._id;
      console.log("✅ Profilo autore creato:", authorProfile._id);
    }

    // Salva l'utente con tutti i profili collegati
    await user.save();

    // Verifica l'aggiornamento
    const updatedUser = await User.findById(user._id)
      .populate("adminProfile")
      .populate("editorProfile")
      .populate("authorProfile");

    return NextResponse.json({
      success: true,
      message: `L'utente ${user.username} (${email}) è stato promosso ad admin con successo`,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Error setting up admin:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
