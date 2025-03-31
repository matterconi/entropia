// File: utils/imageAnalysis.ts

/**
 * Estrae l'ID pubblico da un URL di Cloudinary
 */
export function extractPublicIdFromUrl(url: string): string {
  // Esempio: https://res.cloudinary.com/draubn9nx/image/upload/v1742855214/n66j1jdoy0k3umhodoia.jpg
  const pattern = /\/v\d+\/(.+?)(?:\.\w+)?$/;
  const match = url.match(pattern);

  if (match && match[1]) {
    return match[1];
  }

  throw new Error("Impossibile estrarre l'ID pubblico dall'URL di Cloudinary");
}

/**
 * Calcola la luminosità di un colore RGB
 */
export function calculateBrightness(r: number, g: number, b: number): number {
  // Formula standard per calcolare la luminosità percepita
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Risultato dell'analisi dell'immagine contenente sia il valore di luminosità
 * che le classi di ombra predefinite per facilitare l'implementazione
 */
export interface ImageAnalysisResult {
  isDark: boolean; // true se l'immagine è scura, false se è chiara
  brightness: number; // valore numerico della luminosità (0-255)
  shadowForDark: string; // classe ombra ottimizzata per immagini scure
  shadowForLight: string; // classe ombra ottimizzata per immagini chiare
  invertedShadow: string; // ombra bianca per immagini chiare, nera per scure (invertita)
  defaultShadow: string; // l'ombra consigliata in base all'analisi con logica invertita
}

/**
 * Analizza il colore predominante di un'immagine utilizzando il canvas HTML5
 * Questo approccio funziona interamente lato client, senza chiamate API
 */
export async function analyzeImageColorClientSide(
  imageUrl: string,
): Promise<ImageAnalysisResult> {
  return new Promise((resolve) => {
    try {
      // Crea un'immagine
      const img = new Image();
      img.crossOrigin = "Anonymous"; // Consente di lavorare con immagini cross-origin

      img.onload = () => {
        try {
          // Crea un canvas e disegna l'immagine su di esso
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            throw new Error("Impossibile ottenere il contesto 2D del canvas");
          }

          // Ridimensiona il canvas a una dimensione gestibile per migliorare le prestazioni
          const size = 50; // Una piccola dimensione è sufficiente per analizzare i colori predominanti
          canvas.width = size;
          canvas.height = size;

          // Disegna l'immagine ridimensionata sul canvas
          ctx.drawImage(img, 0, 0, size, size);

          // Ottieni i dati dei pixel
          const imageData = ctx.getImageData(0, 0, size, size);
          const pixels = imageData.data;

          // Calcola la luminosità media dell'immagine
          let totalBrightness = 0;
          let pixelCount = 0;

          for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];

            // Salta i pixel trasparenti
            const a = pixels[i + 3];
            if (a < 128) continue;

            totalBrightness += calculateBrightness(r, g, b);
            pixelCount++;
          }

          // Calcola la luminosità media
          const avgBrightness =
            pixelCount > 0 ? totalBrightness / pixelCount : 128;
          const isDark = avgBrightness < 128;

          // Classi di ombra
          const shadowWhite = "drop-shadow-[0_3px_6px_rgba(255,255,255,0.8)]";
          const shadowBlack = "drop-shadow-[0_3px_6px_rgba(0,0,0,0.8)]";
          const shadowYellow = "drop-shadow-[0_3px_6px_rgba(255,255,0,1)]";

          // LOGICA INVERTITA come richiesto:
          // - Immagine chiara -> ombra chiara (per contrasto col gradient)
          // - Immagine scura -> ombra scura (per contrasto col gradient)
          const result: ImageAnalysisResult = {
            isDark: isDark,
            brightness: avgBrightness,
            shadowForDark: shadowWhite, // ombra tradizionale per immagini scure
            shadowForLight: shadowBlack, // ombra tradizionale per immagini chiare
            invertedShadow: isDark ? shadowBlack : shadowWhite, // INVERTITO!
            defaultShadow: isDark ? shadowBlack : shadowWhite, // Usando la logica invertita
          };

          resolve(result);
        } catch (error) {
          console.error(
            "Errore nell'analisi client-side dell'immagine:",
            error,
          );
          // Fallback result
          resolve({
            isDark: false,
            brightness: 128,
            shadowForDark: "drop-shadow-[0_3px_6px_rgba(255,255,255,0.8)]",
            shadowForLight: "drop-shadow-[0_3px_6px_rgba(0,0,0,0.8)]",
            invertedShadow: "drop-shadow-[0_3px_6px_rgba(0,0,0,0.8)]",
            defaultShadow: "drop-shadow-[0_3px_6px_rgba(255,255,0,1)]",
          });
        }
      };

      img.onerror = () => {
        console.error("Errore nel caricamento dell'immagine");
        // Fallback result
        resolve({
          isDark: false,
          brightness: 128,
          shadowForDark: "drop-shadow-[0_3px_6px_rgba(255,255,255,0.8)]",
          shadowForLight: "drop-shadow-[0_3px_6px_rgba(0,0,0,0.8)]",
          invertedShadow: "drop-shadow-[0_3px_6px_rgba(0,0,0,0.8)]",
          defaultShadow: "drop-shadow-[0_3px_6px_rgba(255,255,0,1)]",
        });
      };

      // Avvia il caricamento dell'immagine
      img.src = imageUrl;
    } catch (error) {
      console.error("Errore nell'analisi client-side dell'immagine:", error);
      // Fallback result
      resolve({
        isDark: false,
        brightness: 128,
        shadowForDark: "drop-shadow-[0_3px_6px_rgba(255,255,255,0.8)]",
        shadowForLight: "drop-shadow-[0_3px_6px_rgba(0,0,0,0.8)]",
        invertedShadow: "drop-shadow-[0_3px_6px_rgba(0,0,0,0.8)]",
        defaultShadow: "drop-shadow-[0_3px_6px_rgba(255,255,0,1)]",
      });
    }
  });
}

/**
 * Tenta di ottenere informazioni sull'immagine tramite l'API server-side
 */
export async function getImageInfoServerSide(imageUrl: string): Promise<any> {
  try {
    // Estrai l'ID pubblico dall'URL di Cloudinary
    const publicId = extractPublicIdFromUrl(imageUrl);

    // Richiedi le informazioni sull'immagine tramite la tua API
    const response = await fetch("/api/cloudinary/image-info", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ publicId, imageUrl }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(
      "Errore nel recupero delle informazioni sull'immagine:",
      error,
    );
    throw error;
  }
}

/**
 * Funzione principale per analizzare l'immagine e ottenere informazioni sulla luminosità
 * Restituisce un oggetto con informazioni complete per dare flessibilità al client
 */
export async function analyzeImage(
  imageUrl: string,
): Promise<ImageAnalysisResult> {
  try {
    // Prima prova con l'API server-side
    const serverResult = await getImageInfoServerSide(imageUrl);

    // Se l'API suggerisce di usare l'analisi client-side o non ha informazioni complete
    if (serverResult.useClientSideAnalysis || !serverResult.avgBrightness) {
      console.log("Utilizzo analisi client-side come fallback");
      return await analyzeImageColorClientSide(imageUrl);
    }

    // Altrimenti usa il risultato dell'API
    const isDark = serverResult.avgBrightness < 128;
    const shadowWhite = "drop-shadow-[0_3px_6px_rgba(255,255,255,0.8)]";
    const shadowBlack = "drop-shadow-[0_3px_6px_rgba(0,0,0,0.8)]";

    return {
      isDark: isDark,
      brightness: serverResult.avgBrightness,
      shadowForDark: shadowWhite,
      shadowForLight: shadowBlack,
      invertedShadow: isDark ? shadowBlack : shadowWhite, // INVERTITO!
      defaultShadow: isDark ? shadowBlack : shadowWhite, // Usando la logica invertita
    };
  } catch (error) {
    console.error(
      "Errore nell'analisi server-side, utilizzo analisi client-side:",
      error,
    );

    // Fallback all'analisi client-side in caso di errore
    return await analyzeImageColorClientSide(imageUrl);
  }
}
