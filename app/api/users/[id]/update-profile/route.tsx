// File: app/api/users/[id]/update-profile/route.ts

import { NextRequest, NextResponse } from "next/server";
import User from "@/database/User";
import dbConnect from "@/lib/mongoose";

// Funzione per caricare un'immagine su Cloudinary
async function uploadImageToCloudinary(imageFile: File, oldImageUrl?: string) {
  try {
    // 1. Ottieni la firma da Cloudinary
    const signatureResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/cloudinary/signature`, {
      method: "POST",
    });
    
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
    
    // Se c'è un'immagine vecchia, aggiungi un flag per l'eliminazione automatica
    if (oldImageUrl) {
      // Estrai l'ID pubblico dall'URL di Cloudinary
      const publicId = extractPublicIdFromUrl(oldImageUrl);
      if (publicId) {
        formData.append("public_id", publicId);
        formData.append("overwrite", "true");
      }
    }
    
    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );
    
    const uploadData = await uploadResponse.json();
    if (!uploadData.secure_url) {
      throw new Error("No image URL received from Cloudinary!");
    }
    
    // 3. Se c'è un'immagine vecchia e non è stata sovrascritta, eliminala
    if (oldImageUrl && extractPublicIdFromUrl(oldImageUrl) !== extractPublicIdFromUrl(uploadData.secure_url)) {
      await deleteImageFromCloudinary(oldImageUrl, signatureData);
    }
    
    return uploadData.secure_url;
  } catch (error: any) {
    console.error("❌ Error uploading image:", error.message);
    throw new Error(`Errore durante il caricamento dell'immagine: ${error.message}`);
  }
}

// Funzione per estrarre l'ID pubblico da un URL di Cloudinary
function extractPublicIdFromUrl(url: string): string | null {
  try {
    // L'URL di Cloudinary è solitamente in questo formato:
    // https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/public_id.ext
    const urlParts = url.split('/');
    const filenameWithExt = urlParts.pop() || '';
    const uploadPart = urlParts.findIndex(part => part === 'upload');
    
    if (uploadPart === -1) return null;
    
    // Prendiamo tutti i segmenti dopo "upload", escludendo eventuali trasformazioni
    const pathAfterUpload = urlParts.slice(uploadPart + 1).join('/');
    
    // Rimuoviamo l'estensione
    const filename = filenameWithExt.split('.')[0];
    
    return pathAfterUpload ? `${pathAfterUpload}/${filename}` : filename;
  } catch (error) {
    console.error("Error extracting public ID:", error);
    return null;
  }
}

// Funzione per eliminare un'immagine da Cloudinary
async function deleteImageFromCloudinary(imageUrl: string, signatureData: any) {
  try {
    const publicId = extractPublicIdFromUrl(imageUrl);
    if (!publicId) return;

    // Ottieni una nuova firma per l'operazione di eliminazione
    const deleteSignatureResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/cloudinary/signature`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action: 'delete', publicId })
    });
    
    const deleteSignatureData = await deleteSignatureResponse.json();
    
    // Chiama l'API di Cloudinary per eliminare l'immagine
    const deleteResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/image/destroy`,
      {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          public_id: publicId,
          signature: deleteSignatureData.signature,
          api_key: deleteSignatureData.api_key,
          timestamp: deleteSignatureData.timestamp
        })
      }
    );
    
    const deleteData = await deleteResponse.json();
    if (deleteData.result !== 'ok') {
      console.warn("Warning: Failed to delete old image from Cloudinary", deleteData);
    }
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    // Non lanciamo l'errore qui perché non vogliamo che l'aggiornamento del profilo fallisca
    // se l'eliminazione dell'immagine vecchia non riesce
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
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
        { status: 404 }
      );
    }
    
    // Analizza il form data
    const formData = await req.formData();
    
    // Gestisci le modifiche al profilo
    const updateFields: { [key: string]: any } = {};
    
    // Verifica lo username (se presente)
    const username = formData.get('username') as string;
    if (username) {
      // Verifica che lo username non sia già in uso (se viene modificato)
      if (username !== existingUser.username) {
        const usernameExists = await User.findOne({
          username,
          _id: { $ne: userId } // esclude l'utente corrente dalla ricerca
        });
        
        if (usernameExists) {
          return NextResponse.json(
            { error: "❌ Username già in uso" },
            { status: 400 }
          );
        }
      }
      updateFields.username = username;
    }
    
    // Gestisci il campo bio (se presente)
    const bio = formData.get('bio') as string;
    if (bio !== undefined) {
      updateFields.bio = bio;
    }
    
    // Gestisci l'immagine del profilo (se presente)
    const profileImage = formData.get('profileImage') as File;
    const oldProfileImg = formData.get('oldProfileImg') as string;
    
    if (profileImage) {
      try {
        // Carica l'immagine su Cloudinary
        const imageUrl = await uploadImageToCloudinary(profileImage, oldProfileImg);
        updateFields.profileImg = imageUrl;
      } catch (error: any) {
        return NextResponse.json(
          { error: `❌ Errore durante il caricamento dell'immagine: ${error.message}` },
          { status: 500 }
        );
      }
    }
    
    // Verifica se ci sono campi da aggiornare
    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { error: "❌ Nessun campo da aggiornare fornito" },
        { status: 400 }
      );
    }
    
    // Esegui l'aggiornamento
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true } // Restituisce il documento aggiornato
    );
    
    return NextResponse.json({
      message: "✅ Profilo aggiornato con successo",
      user: updatedUser
    }, { status: 200 });
    
  } catch (error) {
    console.error("Errore durante l'aggiornamento del profilo:", error);
    return NextResponse.json(
      { error: "❌ Errore interno del server" },
      { status: 500 }
    );
  }
}