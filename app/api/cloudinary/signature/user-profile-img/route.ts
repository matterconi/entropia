import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // Ensure this runs in Node.js runtime

export async function POST(req: NextRequest) {
  try {
    // Estrai informazioni utente dalla richiesta, se presenti
    const body = await req.json().catch(() => ({}));
    const { userId, action, publicId } = body;

    const timestamp = Math.floor(Date.now() / 1000); // Current time in seconds

    // Check if environment variables are correctly loaded
    if (!process.env.CLOUDINARY_API_SECRET) {
      throw new Error("CLOUDINARY_API_SECRET is not defined.");
    }

    if (!process.env.CLOUDINARY_API_KEY) {
      throw new Error("CLOUDINARY_API_KEY is not defined.");
    }

    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      throw new Error("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not defined.");
    }

    // Prepara i parametri per la firma
    const params: Record<string, string> = {
      timestamp: timestamp.toString(),
    };

    // Aggiungi parametri per immagini profilo
    if (action !== "delete" && userId) {
      params.folder = "user_profiles";
      params.tags = "user_profile";
      const fileName = `profile_${userId}_${Date.now()}`;
      params.public_id = `user_profiles/${fileName}`;
    }

    // Per l'eliminazione, usa il publicId fornito
    if (action === "delete" && publicId) {
      params.public_id = publicId;
    }

    // Genera la stringa per la firma ordinando i parametri
    const paramsString = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join("&");

    // Genera una firma SHA-1 con tutti i parametri
    const signatureString = `${paramsString}${process.env.CLOUDINARY_API_SECRET}`;
    const signature = crypto
      .createHash("sha1")
      .update(signatureString)
      .digest("hex");

    return NextResponse.json({
      signature,
      timestamp: timestamp.toString(),
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      // Includi gli altri parametri nel risultato
      ...(params.folder && { folder: params.folder }),
      ...(params.tags && { tags: params.tags }),
      ...(params.public_id && { public_id: params.public_id }),
    });
  } catch (error: any) {
    console.error("❌ Cloudinary User Signature Error:", error.message);
    return NextResponse.json(
      { error: "Failed to generate Cloudinary signature for user profile." },
      { status: 500 },
    );
  }
}
