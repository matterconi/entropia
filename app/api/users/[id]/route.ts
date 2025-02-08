import { NextRequest, NextResponse } from "next/server";

import User from "@/database/User";
import dbConnect from "@/lib/mongoose";

export async function GET(req: NextRequest) {
  try {
    await dbConnect(); // Assicura la connessione al database

    // Recupera i parametri di query (opzionale: filtro per email o ID)
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const id = searchParams.get("id");

    let users;

    if (email) {
      users = await User.findOne({ email });
      if (!users) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    } else if (id) {
      users = await User.findById(id);
      if (!users) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    } else {
      users = await User.find(); // Recupera tutti gli utenti
    }

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    return NextResponse.json(
      { error: "❌ Failed to retrieve users" },
      { status: 500 },
    );
  }
}

// ✅ PUT: Aggiorna l'username di un utente in base all'ID o all'email
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await dbConnect();

    const { id } = params; // ✅ Ora l'ID viene preso dall'URL
    const { username } = await req.json();

    if (!username || username.length < 3) {
      return NextResponse.json(
        { error: "Invalid username. Minimum 3 characters required." },
        { status: 400 },
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { username },
      { new: true }, // Restituisce il documento aggiornato
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ Assicuriamoci di restituire tutti i dati dell'utente
    return NextResponse.json({
      message: "Username updated successfully",
      user: {
        id: updatedUser._id.toString(), // Converte ObjectId in stringa
        username: updatedUser.username,
        email: updatedUser.email, // Mantiene l'email e altri campi
        profileImg: updatedUser.profileImg,
        isAuthor: updatedUser.isAuthor,
      },
    });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    return NextResponse.json(
      { error: "❌ Failed to update username" },
      { status: 500 },
    );
  }
}
