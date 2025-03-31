// app/api/admin/users/[id]/role/route.ts
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import User from "@/database/User";
import dbConnect from "@/lib/mongoose";
import { assignRole } from "@/lib/role-handlers";

// Endpoint per aggiornare il ruolo di un utente (solo admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  await dbConnect();
  const session = await auth();

  // Verifica autenticazione
  if (!session) {
    return NextResponse.json({ message: "Non autenticato" }, { status: 401 });
  }

  // Verifica che sia un admin
  const adminUser = await User.findById(session.user.id);
  if (!adminUser || adminUser.role !== "admin") {
    return NextResponse.json(
      { message: "Accesso negato. Richiesti privilegi di amministratore." },
      { status: 403 },
    );
  }

  try {
    const { id } = params;
    const { role } = await request.json();

    // Verifica che il ruolo sia valido
    if (!["user", "author", "editor", "admin"].includes(role)) {
      return NextResponse.json(
        { message: "Ruolo non valido" },
        { status: 400 },
      );
    }

    // Assegna il ruolo
    const result = await assignRole(id, role, session.user.id);

    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: 400 });
    }

    return NextResponse.json({
      message: result.message,
      user: {
        id: result.user._id,
        username: result.user.username,
        email: result.user.email,
        role: result.user.role,
      },
    });
  } catch (error: any) {
    console.error("Errore nell'aggiornamento del ruolo:", error);
    return NextResponse.json(
      { message: `Errore: ${error.message}` },
      { status: 500 },
    );
  }
}

// GET per ottenere informazioni sul ruolo di un utente
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  await dbConnect();
  const session = await auth();

  // Verifica autenticazione
  if (!session) {
    return NextResponse.json({ message: "Non autenticato" }, { status: 401 });
  }

  try {
    const { id } = params;

    // Ottieni informazioni di base sull'utente
    const user = await User.findById(id).select(
      "username email role profileImg bio",
    );

    if (!user) {
      return NextResponse.json(
        { message: "Utente non trovato" },
        { status: 404 },
      );
    }

    // Se chi fa la richiesta è un admin o l'utente stesso, fornisci più dettagli
    if (
      session.user.id === id ||
      (await User.findById(session.user.id))?.role === "admin"
    ) {
      // Popolamento condizionale dei profili specializzati
      let profileDetails = {};

      if (user.role === "editor" && user.editorProfile) {
        const Editor = mongoose.models.Editor;
        const editorProfile = await Editor.findById(user.editorProfile).select(
          "articles_reviewed articles_published articles_rejected specialties",
        );

        if (editorProfile) {
          profileDetails = {
            editor: {
              articles_reviewed: editorProfile.articles_reviewed,
              articles_published: editorProfile.articles_published,
              articles_rejected: editorProfile.articles_rejected,
              specialties: editorProfile.specialties,
            },
          };
        }
      } else if (user.role === "admin" && user.adminProfile) {
        // Per gli admin, forniamo solo informazioni basiche sul loro profilo
        const Admin = mongoose.models.Admin;
        const adminProfile = await Admin.findById(user.adminProfile).select(
          "last_activity",
        );

        if (adminProfile) {
          profileDetails = {
            admin: {
              last_activity: adminProfile.last_activity,
            },
          };
        }
      }

      // Restituisci risposta dettagliata
      return NextResponse.json({
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          profileImg: user.profileImg,
          bio: user.bio,
          ...profileDetails,
        },
      });
    }

    // Per altri utenti, restituisci solo informazioni di base
    return NextResponse.json({
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        profileImg: user.profileImg,
        bio: user.bio,
      },
    });
  } catch (error: any) {
    console.error("Errore nel recupero delle informazioni sul ruolo:", error);
    return NextResponse.json(
      { message: `Errore: ${error.message}` },
      { status: 500 },
    );
  }
}
