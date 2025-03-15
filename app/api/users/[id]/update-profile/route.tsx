// File: app/api/users/[id]/update-profile/route.ts

import { NextRequest, NextResponse } from "next/server";

import User from "@/database/User";
import dbConnect from "@/lib/mongoose";

// Funzione per caricare un'immagine su Cloudinary
async function uploadImageToCloudinary(
  imageFile: File,
  oldImageUrl?: string,
  userId?: string,
) {
  try {
    // 1. Ottieni la firma da Cloudinary, passando l'ID utente
    const signatureResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/cloudinary/signature/user-profile-img`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }), // Passa l'ID utente
      },
    );

    const signatureData = await signatureResponse.json();
    if (!signatureData.signature || !signatureData.timestamp) {
      throw new Error("Signature or timestamp is missing from API response.");
    }

    // 2. Carica l'immagine su Cloudinary
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("timestamp", signatureData.timestamp);
    formData.append("signature", signatureData.signature);
    formData.append("api_key", signatureData.api_key);
    formData.append("cloud_name", signatureData.cloud_name);

    // Aggiungi gli stessi parametri che sono stati usati per creare la firma
    if (signatureData.folder) {
      formData.append("folder", signatureData.folder);
    }

    if (signatureData.tags) {
      formData.append("tags", signatureData.tags);
    }

    if (signatureData.public_id) {
      formData.append("public_id", signatureData.public_id);
    }

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    // Logga la risposta esatta
    const responseText = await uploadResponse.text();
    console.log("Cloudinary response (raw):", responseText);

    let uploadData;
    try {
      uploadData = JSON.parse(responseText);
      console.log("Cloudinary response details:", uploadData);
    } catch (e) {
      console.error("Failed to parse response as JSON:", e);
      throw new Error(
        `Invalid response from Cloudinary: ${responseText.substring(0, 200)}`,
      );
    }

    if (!uploadResponse.ok) {
      console.error("Cloudinary auth error:", {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText,
        details: uploadData,
      });
      throw new Error(
        `Cloudinary upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`,
      );
    }

    if (!uploadData.secure_url) {
      console.error("Missing secure_url in response:", uploadData);
      throw new Error("No image URL received from Cloudinary!");
    }

    // 3. Se c'è un'immagine vecchia e non è stata sovrascritta, eliminala
    if (
      oldImageUrl &&
      extractPublicIdFromUrl(oldImageUrl) !==
        extractPublicIdFromUrl(uploadData.secure_url)
    ) {
      // Verifica che l'immagine precedente sia un'immagine profilo prima di eliminarla
      const oldPublicId = extractPublicIdFromUrl(oldImageUrl);
      if (
        oldPublicId &&
        (oldPublicId.includes("user_profiles") ||
          oldPublicId.includes("profile_"))
      ) {
        await deleteImageFromCloudinary(oldImageUrl);
      } else {
        console.log(
          "Skipping deletion as the old image is not a profile image",
        );
      }
    }

    return uploadData.secure_url;
  } catch (error: any) {
    console.error("❌ Error uploading image:", error.message);
    throw new Error(
      `Errore durante il caricamento dell'immagine: ${error.message}`,
    );
  }
}

// Funzione per eliminare un'immagine da Cloudinary
async function deleteImageFromCloudinary(imageUrl: string) {
  try {
    console.log("🔍 Starting image deletion process for:", imageUrl);

    const publicId = extractPublicIdFromUrl(imageUrl);
    if (!publicId) {
      console.error("❌ Could not extract public_id from URL:", imageUrl);
      return false;
    }

    console.log("📝 Extracted public_id:", publicId);

    // Verifica di sicurezza: assicurati di eliminare solo immagini profilo
    if (!publicId.includes("user_profiles") && !publicId.includes("profile_")) {
      console.warn(
        "⚠️ Attempted to delete a non-profile image, operation aborted:",
        publicId,
      );
      return false;
    }

    // Ottieni la firma per l'operazione di eliminazione
    console.log("🔑 Requesting delete signature for public_id:", publicId);
    const deleteSignatureResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/cloudinary/signature/user-profile-img`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "delete", publicId }),
      },
    );

    if (!deleteSignatureResponse.ok) {
      const errorText = await deleteSignatureResponse.text();
      console.error("❌ Failed to get delete signature:", {
        status: deleteSignatureResponse.status,
        text: errorText,
      });
      return false;
    }

    const deleteSignatureData = await deleteSignatureResponse.json();
    console.log("📋 Signature data received:", {
      timestamp: deleteSignatureData.timestamp,
      signature: deleteSignatureData.signature ? "✓ Present" : "❌ Missing",
      api_key: deleteSignatureData.api_key ? "✓ Present" : "❌ Missing",
      cloud_name: deleteSignatureData.cloud_name,
    });

    if (!deleteSignatureData.signature || !deleteSignatureData.timestamp) {
      console.error(
        "❌ Delete signature or timestamp is missing from API response.",
      );
      return false;
    }

    // Prepara i dati per l'eliminazione
    const deletePayload = {
      public_id: publicId,
      signature: deleteSignatureData.signature,
      api_key: deleteSignatureData.api_key,
      timestamp: deleteSignatureData.timestamp,
    };

    console.log("🔧 Delete payload:", deletePayload);

    // Chiama l'API di Cloudinary per eliminare l'immagine
    console.log("🗑️ Sending delete request to Cloudinary");
    const deleteResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${deleteSignatureData.cloud_name}/image/destroy`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deletePayload),
      },
    );

    // Log della risposta completa
    const responseText = await deleteResponse.text();
    console.log("📄 Raw delete response:", responseText);

    let deleteData;
    try {
      deleteData = JSON.parse(responseText);
      console.log("📊 Parsed delete response:", deleteData);
    } catch (e) {
      console.error("❌ Failed to parse delete response as JSON:", e);
      return false;
    }

    if (deleteData.result !== "ok") {
      console.warn(
        "⚠️ Warning: Failed to delete image from Cloudinary",
        deleteData,
      );
      return false;
    } else {
      console.log("✅ Successfully deleted profile image:", publicId);
      return true;
    }
  } catch (error) {
    console.error("❌ Error deleting image from Cloudinary:", error);
    return false;
  }
}

// Funzione per estrarre l'ID pubblico da un URL di Cloudinary
function extractPublicIdFromUrl(url: string): string | null {
  if (!url || typeof url !== "string") return null;

  try {
    console.log("Extracting public_id from:", url);

    // Rimuovi i parametri di trasformazione (tutto dopo ?)
    const cleanUrl = url.split("?")[0];

    // URL Cloudinary standard con versione
    const versionRegex = /\/v\d+\/(.+?)(?:\.[^.]+)?$/;
    const versionMatch = cleanUrl.match(versionRegex);

    if (versionMatch && versionMatch[1]) {
      console.log("Extracted public_id (with version):", versionMatch[1]);
      return versionMatch[1];
    }

    // URL Cloudinary standard senza versione
    const uploadRegex = /\/upload\/(.+?)(?:\.[^.]+)?$/;
    const uploadMatch = cleanUrl.match(uploadRegex);

    if (uploadMatch && uploadMatch[1]) {
      console.log("Extracted public_id (from upload):", uploadMatch[1]);
      return uploadMatch[1];
    }

    console.log("Could not extract public_id using regex patterns");
    return null;
  } catch (error) {
    console.error("Error extracting public_id:", error);
    return null;
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const userId = params.id;

    // Connetti al database
    await dbConnect();

    // Verifica che l'utente esista
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return NextResponse.json(
        { error: "❌ Utente non trovato" },
        { status: 404 },
      );
    }

    // Analizza il form data
    const formData = await req.formData();

    // Gestisci le modifiche al profilo
    const updateFields: { [key: string]: any } = {};

    // Verifica lo username (se presente)
    const username = formData.get("username") as string;
    if (username) {
      // Verifica che lo username non sia già in uso (se viene modificato)
      if (username !== existingUser.username) {
        const usernameExists = await User.findOne({
          username,
          _id: { $ne: userId }, // esclude l'utente corrente dalla ricerca
        });

        if (usernameExists) {
          return NextResponse.json(
            { error: "❌ Username già in uso" },
            { status: 400 },
          );
        }
      }
      updateFields.username = username;
    }

    // Gestisci il campo bio (se presente)
    const bio = formData.get("bio") as string;
    if (bio !== undefined) {
      updateFields.bio = bio;
    }

    // Gestisci l'immagine del profilo (se presente)
    const profileImage = formData.get("profileImage") as File;
    const oldProfileImg = formData.get("oldProfileImg") as string;

    if (profileImage) {
      try {
        // Carica l'immagine su Cloudinary
        const imageUrl = await uploadImageToCloudinary(
          profileImage,
          oldProfileImg,
          userId, // Aggiungi l'ID utente
        );
        updateFields.profileImg = imageUrl;
      } catch (error: any) {
        return NextResponse.json(
          {
            error: `❌ Errore durante il caricamento dell'immagine: ${error.message}`,
          },
          { status: 500 },
        );
      }
    }

    // Verifica se ci sono campi da aggiornare
    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { error: "❌ Nessun campo da aggiornare fornito" },
        { status: 400 },
      );
    }

    // Esegui l'aggiornamento
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }, // Restituisce il documento aggiornato
    );

    return NextResponse.json(
      {
        message: "✅ Profilo aggiornato con successo",
        user: updatedUser,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Errore durante l'aggiornamento del profilo:", error);
    return NextResponse.json(
      { error: "❌ Errore interno del server" },
      { status: 500 },
    );
  }
}
