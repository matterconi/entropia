// File: app/api/cloudinary/image-info/route.ts
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // Ensure this runs in Node.js runtime

export async function POST(req: NextRequest) {
  try {
    // Estrai public_id dalla richiesta
    const body = await req.json().catch(() => ({}));
    const { publicId, imageUrl } = body;

    if (!publicId && !imageUrl) {
      return NextResponse.json(
        { error: "Public ID or Image URL is required" },
        { status: 400 },
      );
    }

    // Se abbiamo l'URL ma non l'ID, estraiamo l'ID
    let finalPublicId = publicId;
    if (!finalPublicId && imageUrl) {
      const pattern = /\/v\d+\/(.+?)(?:\.\w+)?$/;
      const match = imageUrl.match(pattern);

      if (match && match[1]) {
        finalPublicId = match[1];
      } else {
        throw new Error("Impossibile estrarre l'ID pubblico dall'URL");
      }
    }

    // Verifica che le variabili d'ambiente siano correttamente caricate
    if (!process.env.CLOUDINARY_API_SECRET) {
      throw new Error("CLOUDINARY_API_SECRET is not defined.");
    }

    if (!process.env.CLOUDINARY_API_KEY) {
      throw new Error("CLOUDINARY_API_KEY is not defined.");
    }

    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      throw new Error("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not defined.");
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    // Creiamo una firma simile al metodo di upload
    const signatureString = `public_id=${finalPublicId}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`;
    const signature = crypto
      .createHash("sha1")
      .update(signatureString)
      .digest("hex");

    // Creiamo un URL per ottenere le informazioni sull'immagine in un modo simile alla funzione di upload
    const formData = new FormData();
    formData.append("public_id", finalPublicId);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("api_key", apiKey);
    formData.append("colors", "true");

    // Effettua la richiesta a Cloudinary
    const infoResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/info`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!infoResponse.ok) {
      // Se non funziona con l'API, utilizziamo un approccio alternativo
      return NextResponse.json({
        useClientSideAnalysis: true,
        textShadow: "drop-shadow-[0_3px_6px_rgba(255,255,0,1)]", // Default shadow
      });
    }

    const imageData = await infoResponse.json();

    // Estrai e analizza i dati dei colori
    let textShadow = "drop-shadow-[0_3px_6px_rgba(255,255,0,1)]"; // Default shadow
    let avgBrightness = 128;

    if (imageData.colors && imageData.colors.length > 0) {
      // Calcola la luminosità media
      let totalBrightness = 0;
      let totalWeight = 0;

      imageData.colors.forEach((colorInfo: any) => {
        // Il formato può variare, adattiamo in base al formato restituito
        let color, percent;

        if (Array.isArray(colorInfo)) {
          [color, percent] = colorInfo;
        } else if (typeof colorInfo === "object") {
          color = colorInfo.color;
          percent = colorInfo.percent || 1;
        }

        if (color && color.startsWith("#")) {
          const r = parseInt(color.substring(1, 3), 16);
          const g = parseInt(color.substring(3, 5), 16);
          const b = parseInt(color.substring(5, 7), 16);

          const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

          totalBrightness += brightness * percent;
          totalWeight += percent;
        }
      });

      if (totalWeight > 0) {
        avgBrightness = totalBrightness / totalWeight;
      }

      // Determina l'ombra in base alla luminosità
      textShadow =
        avgBrightness < 128
          ? "drop-shadow-[0_3px_6px_rgba(255,255,255,0.8)]"
          : "drop-shadow-[0_3px_6px_rgba(0,0,0,0.8)]";
    }

    return NextResponse.json({
      textShadow,
      avgBrightness,
      useClientSideAnalysis: false,
      colors: imageData.colors || [],
      width: imageData.width,
      height: imageData.height,
      format: imageData.format,
    });
  } catch (error: any) {
    console.error("❌ Cloudinary Image Info Error:", error.message);
    // In caso di errore restituiamo un segnale per utilizzare l'analisi client-side
    return NextResponse.json({
      useClientSideAnalysis: true,
      textShadow: "drop-shadow-[0_3px_6px_rgba(255,255,0,1)]",
      error: error.message,
    });
  }
}
