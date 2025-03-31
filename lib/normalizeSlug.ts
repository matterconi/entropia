/**
 * Gestisce la conversione di slug URL-encoded in slug normalizzati o originali con accenti
 * @param {string} slug - Lo slug che potrebbe contenere caratteri URL-encoded
 * @returns {object} - Oggetto con versioni normalizzate e originali dello slug
 */
const processSlug = (slug: string): string => {
  if (!slug) return "";

  try {
    console.log("🔍 Input ricevuto:", slug);

    // PASSO 1: Decodifica l'URL encoding
    let decodedSlug;
    try {
      decodedSlug = decodeURIComponent(slug);
      console.log("🔍 Dopo decodeURIComponent:", decodedSlug);
    } catch (e) {
      console.error("⚠️ Errore nella decodifica URL:", e);
      decodedSlug = slug; // Fallback all'input originale
    }

    // PASSO 2: Preserva la versione originale (con accenti)
    const originalSlug = decodedSlug;

    // PASSO 3: Normalizza (rimuovi accenti)
    let normalizedSlug = decodedSlug.toLowerCase();

    // Mappa per la normalizzazione
    const normalizeMap: { [key: string]: string } = {
      à: "a",
      è: "e",
      é: "e",
      ì: "i",
      ò: "o",
      ù: "u",
      ä: "a",
      ë: "e",
      ï: "i",
      ö: "o",
      ü: "u",
      â: "a",
      ê: "e",
      î: "i",
      ô: "o",
      û: "u",
      ç: "c",
      ñ: "n",
    };

    // Applica la normalizzazione
    for (const [accented, plain] of Object.entries(normalizeMap)) {
      normalizedSlug = normalizedSlug.replace(new RegExp(accented, "g"), plain);
    }

    // PASSO 4: Sostituisci spazi con trattini
    normalizedSlug = normalizedSlug.replace(/\s+/g, "-");

    // Aggiorno anche il valore da ritornare per usare i trattini
    const slugWithDashes = decodedSlug.replace(/\s+/g, "-");

    console.log("🔍 Versione normalizzata:", normalizedSlug);

    return slugWithDashes; // Ritorno la versione con trattini
  } catch (error) {
    console.error("❌ Errore globale nel processamento:", error);
    return "error";
  }
};

export { processSlug as denormalizeSlug };
