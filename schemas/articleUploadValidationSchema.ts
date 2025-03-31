import * as z from "zod";

// Schema di base comune a tutti i tipi
const baseSchema = {
  title: z.string().min(5, "Il titolo deve avere almeno 5 caratteri"),
  category: z.string().min(1, "Seleziona almeno una categoria"),
  genres: z.array(z.string()),
  topics: z.array(z.string()),
};

// Schema articolo singolo
export const postSchema = z.object({
  ...baseSchema,
  markdownPath: z.string().min(1, "Il file markdown è obbligatorio"),
  coverImage: z.string().url("URL immagine non valido"),
});

// Schema serie
export const serieSchema = z.object({
  ...baseSchema,
  coverImage: z.string().url("URL immagine non valido"),
  chapterTitle: z
    .string()
    .min(5, "Il titolo del capitolo deve avere almeno 5 caratteri"),
  markdownPath: z.string().min(1, "Il file markdown è obbligatorio"),
});

// Schema capitolo
export const capitoloSchema = z.object({
  serieId: z.string().min(1, "Seleziona una serie"),
  chapterTitle: z
    .string()
    .min(5, "Il titolo del capitolo deve avere almeno 5 caratteri"),
  markdownPath: z.string().min(1, "Il file markdown è obbligatorio"),
  coverImage: z.string().optional(), // Immagine opzionale per i capitoli
});

// Helper per ottenere lo schema corretto in base al tipo
export function getSchema(tipo: string) {
  switch (tipo) {
    case "post":
      return postSchema;
    case "serie":
      return serieSchema;
    case "capitolo":
      return capitoloSchema;
    default:
      return postSchema;
  }
}

// Helper per ottenere i valori predefiniti in base al tipo
export function getDefaultValues(tipo: string) {
  const baseValues = {
    title: "",
    category: "",
    genres: [],
    topics: [],
  };

  switch (tipo) {
    case "post":
      return {
        ...baseValues,
        markdownPath: "",
        coverImage: "",
      };
    case "serie":
      return {
        ...baseValues,
        coverImage: "",
        chapterTitle: "",
        markdownPath: "",
      };
    case "capitolo":
      return {
        serieId: "",
        chapterTitle: "",
        markdownPath: "",
        coverImage: "",
      };
    default:
      return baseValues;
  }
}
