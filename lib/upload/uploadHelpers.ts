import { getSession } from "next-auth/react";

// Funzione per uploadare il file markdown su Supabase
export async function uploadMarkdownToSupabase(
  file: File,
  userId: string,
  setUploading: (value: boolean) => void,
  onSuccess: (filePath: string) => void,
) {
  try {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("articleId", `${userId}-${Date.now()}`); // Nome univoco

    const response = await fetch("/api/supabase/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to upload Markdown file.");

    const data = await response.json();
    console.log("✅ Markdown uploaded:", data.filePath);
    onSuccess(data.filePath);
  } catch (error: any) {
    console.error("❌ Error uploading Markdown:", error.message);
    alert("Failed to upload Markdown file.");
  } finally {
    setUploading(false);
  }
}

// Funzione per uploadare l'immagine su Cloudinary
export async function uploadImageToCloudinary(
  imageFile: File,
  setUploading: (value: boolean) => void,
  onSuccess: (imageUrl: string) => void,
) {
  try {
    setUploading(true);

    // Get Cloudinary signature
    const signatureResponse = await fetch("/api/cloudinary/signature", {
      method: "POST",
    });

    const signatureData = await signatureResponse.json();
    if (!signatureData.signature || !signatureData.timestamp) {
      throw new Error("Signature or timestamp is missing from API response.");
    }

    // Upload Image to Cloudinary
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("timestamp", signatureData.timestamp);
    formData.append("signature", signatureData.signature);
    formData.append("api_key", signatureData.api_key);

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

    onSuccess(uploadData.secure_url);
  } catch (error: any) {
    console.error("❌ Error uploading image:", error.message);
  } finally {
    setUploading(false);
  }
}

// Funzione per inviare il form in base al tipo
// Funzione per inviare il form in base al tipo
export async function submitFormData(
  tipo: string,
  data: any,
  userId: string,
  setUploading: (value: boolean) => void,
) {
  console.log(`Dati del form ${tipo} inviati:`, data);
  setUploading(true);

  try {
    // Ottieni la sessione corrente usando next-auth
    const session = await getSession();
    console.log("Session:", session);

    if (!session || !session.user) {
      throw new Error("Sessione non valida o utente non autenticato");
    }

    let endpoint, formData;

    // Costruisci l'endpoint in base al tipo e all'userId
    switch (tipo) {
      case "post":
        endpoint = `/api/author/${userId}/articles`;
        formData = {
          title: data.title,
          coverImage: data.coverImage,
          markdownPath: data.markdownPath,
          categories: data.category,
          genres: data.genres,
          topics: data.topics,
          // Non è necessario includere author poiché è già nell'URL
        };
        break;

      case "serie":
        endpoint = `/api/author/${userId}/collections`; // Assicurati che questo sia l'endpoint corretto
        formData = {
          // Serie details
          title: data.title,
          description: data.description, // Aggiungi la descrizione se disponibile
          coverImage: data.coverImage,
          isComplete: false,

          // First chapter details
          chapterTitle: data.chapterTitle || data.title, // Usa subtitle come chapterTitle o il titolo della serie
          chapterCoverImage: data.articleCoverImage || data.coverImage,
          chapterMarkdownPath: data.articleMarkdownPath || data.markdownPath,
          chapterMarkdownContent: data.markdownContent, // Assicurati di inviare anche questo

          // Optional tags
          chapterCategories: data.category || data.articleCategories || [],
          chapterGenres: data.genres || data.articleGenres || [],
          chapterTopics: data.topics || data.articleTopics || [],

          // Impostazioni opzionali
          performAIAnalysis: true,
          allowNewTags: true,
        };
        break;

      case "capitolo":
        endpoint = `/api/author/${userId}/chapters`;
        formData = {
          serieId: data.serieId,
          title: data.chapterTitle,
          markdownPath: data.markdownPath,
          coverImage: data.coverImage || null, // Opzionale
        };
        break;

      default:
        throw new Error("Tipo non valido");
    }

    // Includi i dati della sessione nell'endpoint con il cookie
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
      // Questo assicura che i cookie vengano inviati con la richiesta
      credentials: "include",
    });

    // Gestione degli errori
    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData?.error || `Errore nel caricamento del ${tipo}`;
      } catch {
        errorMessage =
          (await response.text()) || `Errore nel caricamento del ${tipo}`;
      }

      // Gestisci errori di autorizzazione
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          `Non sei autorizzato a pubblicare contenuti: ${errorMessage}`,
        );
      }

      throw new Error(errorMessage);
    }

    // Gestione della risposta di successo
    const responseData = await response.json();
    console.log(
      `✅ ${tipo.charAt(0).toUpperCase() + tipo.slice(1)} caricato con successo:`,
      responseData,
    );

    // Redirect alla dashboard appropriata o alla pagina del contenuto appena creato
    if (responseData.redirectUrl) {
      window.location.href = responseData.redirectUrl;
    } else {
      // Redirect basato sul tipo di contenuto
      switch (tipo) {
        case "post":
          window.location.href = `/`;
          break;
        case "serie":
          window.location.href = `/`;
          break;
        case "capitolo":
          window.location.href = `/`;
          break;
        default:
          window.location.href = "/";
      }
    }
  } catch (error: any) {
    console.error(`❌ Errore nell'invio:`, error);
    alert(`Errore: ${error.message || `Errore nel caricamento del ${tipo}.`}`);
  } finally {
    setUploading(false);
  }
}
