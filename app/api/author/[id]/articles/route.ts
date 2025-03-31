import { createDeepSeek } from "@ai-sdk/deepseek";
import { createClient } from "@supabase/supabase-js";
import { generateText } from "ai";
// ✅ Verifica autenticazione utente
import { verify } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai"; // Manteniamo OpenAI per gli embedding

import { auth } from "@/auth";
import Article from "@/database/Article";
import Category from "@/database/Category";
import Genre from "@/database/Genre";
import Topic from "@/database/Topic";
import User from "@/database/User";
import dbConnect from "@/lib/mongoose";
import updateModelStats from "@/lib/updateModelStats";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY || "",
});

// 📝 POST: Crea un nuovo articolo
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    console.log("🔹 API /author/:id/articles: Connessione al database...");
    await dbConnect();

    // Estrai l'ID autore dai parametri della route
    const routeUserId = params.id;
    console.log("🔹 ID utente dalla route:", routeUserId);

    // Ottieni la sessione utente usando auth() da NextAuth v5
    const session = await auth();

    // Verifica che l'utente sia autenticato
    if (!session || !session.user) {
      console.error("❌ Errore: Utente non autenticato");
      return NextResponse.json(
        { error: "Unauthorized: Authentication required" },
        { status: 401 },
      );
    }

    // Ottieni l'ID utente autenticato dalla sessione
    const authenticatedUserId = session.user.id;

    if (!authenticatedUserId) {
      console.error("❌ Errore: ID utente non trovato nella sessione");
      return NextResponse.json(
        { error: "Unauthorized: User ID not found in session" },
        { status: 401 },
      );
    }

    // Verifica che l'utente autenticato corrisponda all'ID nella route
    // oppure che sia un admin che può gestire gli articoli di altri utenti
    if (authenticatedUserId !== routeUserId) {
      // Se l'ID non corrisponde, controlla se l'utente è un admin
      const userDoc = await User.findById(authenticatedUserId);

      if (!userDoc || userDoc.role !== "admin") {
        console.error(
          "❌ Errore: ID utente nella route non corrisponde all'utente autenticato",
          {
            routeUserId,
            authenticatedUserId,
          },
        );
        return NextResponse.json(
          {
            error:
              "Forbidden: You can only create articles under your own account",
          },
          { status: 403 },
        );
      }

      // Se è un admin, può continuare ma lo loggiamo per tracciabilità
      console.log("⚠️ Admin sta creando un articolo per un altro utente", {
        adminId: authenticatedUserId,
        targetUserId: routeUserId,
      });
    }

    // Recupera l'utente target dal database
    const targetUserDoc = await User.findById(routeUserId);
    if (!targetUserDoc) {
      console.error("❌ Errore: Utente target non trovato nel database");
      return NextResponse.json(
        { error: "Not Found: Target user does not exist" },
        { status: 404 },
      );
    }

    // ✅ Legge i dati in JSON
    const {
      title,
      coverImage,
      markdownPath,
      markdownContent,
      categories: initialCategories = [],
      genres: initialGenres = [],
      topics: initialTopics = [],
      performAIAnalysis = true,
      allowNewTags = true, // Parametro per consentire la creazione di nuovi tag
    } = await req.json();

    console.log("📩 Dati ricevuti:", {
      title,
      coverImage,
      markdownPath,
      initialCategories,
      initialGenres,
      initialTopics,
      performAIAnalysis,
      allowNewTags,
    });

    // Verifica che l'utente target abbia i permessi per creare articoli
    if (
      !targetUserDoc.role ||
      (targetUserDoc.role !== "author" &&
        targetUserDoc.role !== "admin" &&
        targetUserDoc.role !== "editor")
    ) {
      console.error("❌ Errore: Utente target non ha i permessi necessari", {
        role: targetUserDoc.role || "non trovato",
      });
      return NextResponse.json(
        {
          error:
            "Forbidden: Target user does not have permission to create articles",
        },
        { status: 403 },
      );
    }

    // Converti i tag in minuscolo
    let categories = [initialCategories.trim().toLowerCase()]; // Converti in minuscolo
    let genres = initialGenres.map((genre: string) => genre.toLowerCase()); // Converti in minuscolo
    let topics = initialTopics.map((topic: string) => topic.toLowerCase()); // Converti in minuscolo

    console.log("🔹 Tag normalizzati e convertiti in minuscolo:");
    console.log("🔹 Categorie:", categories);
    console.log("🔹 Generi:", genres);
    console.log("🔹 Topic:", topics);

    let newTagsCreated = { genres: [] as string[], topics: [] as string[] }; // Teniamo traccia dei nuovi tag creati

    // ✅ Verifica che tutti i campi richiesti siano presenti
    if (!title || !coverImage || !markdownPath) {
      console.error("❌ Errore: Dati mancanti!");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Usa l'ID dell'utente dalla route come author
    const author = routeUserId;

    let textForAnalysis;
    let aiAnalysisResults = null;

    // Se è richiesta l'analisi AI, ottieni il testo del markdown
    if (performAIAnalysis) {
      // Ottieni il contenuto del markdown se non è già stato fornito
      if (!markdownContent) {
        // Assumo che markdownPath sia un percorso valido per Supabase
        // Potresti aver bisogno di adattare questo codice al tuo storage effettivo
        const { data, error } = await supabase.storage
          .from("articles-content")
          .download(markdownPath);

        if (error) {
          console.error("❌ Errore nel recupero del file markdown:", error);
          throw new Error("Failed to retrieve markdown content");
        }

        // Converti il blob in testo
        textForAnalysis = await data.text();
      } else {
        textForAnalysis = markdownContent;
      }

      // Esegui l'analisi AI
      console.log("🧠 Avvio analisi AI...");

      // Ottieni tutti i generi e topic dal database per il prompt
      const allGenres = await Genre.find().select("name");
      const allTopics = await Topic.find().select("name");

      const genreNames = allGenres.map((g) => g.name);
      const topicNames = allTopics.map((t) => t.name);

      // Lista di parole straniere comuni in italiano per il prompt
      const commonForeignWords = [
        "pop",
        "rock",
        "jazz",
        "blues",
        "folk",
        "computer",
        "web",
        "online",
        "software",
        "hardware",
        "fantasy",
        "thriller",
        "horror",
        "cyberpunk",
        "steampunk",
        "film",
        "noir",
        "vintage",
        "podcast",
        "blog",
        "social",
        "video",
        "sport",
        "trend",
        "cloud",
        "green",
        "slow",
        "food",
        "vegan",
        "smart",
      ].join(", ");

      // Prepara il prompt basato sui generi e topic già forniti
      let promptContent = `
		Analizza il seguente testo e:
		"Crea una descrizione di circa 25 parole (tra 20 e 30) in stile Netflix basata sul contenuto specifico del testo.

		IMPORTANTE:
		- VIETATO usare le seguenti espressioni o formule simili: "un viaggio", "una guida", "in un mondo", .
		- VIETATO utilizzare aggettivi generici in sequenza (poetico, coinvolgente, surreale).
		- VIETATO utilizzare ripetutamente espressioni presenti nel testo, la descrizione non deve copiare, deve anticipare. 
		- PREFERISCI le forme attive dei verbi a quelle passive. Non "Un codice si scontra con riflessioni esistenziali", ma "un codice affronta riflessioni esistenziali", non "La memoria del colore degli occhi amati si dissolve" ma "La memoria dissolve il colore degli occhi amati.", non "Grida silenziose di morti recenti si intrecciano ad arabeschi" ma "Morti recenti gridano silenziosamente tra arabeschi".
		- PUOI usare le stesse parole presenti nel testo, ma non forzatamente o nella stessa sequenza. Quindi non copiare frasi intere.
		- PUOI usare la punteggiatura. Se la frase è troppo lunga, spezzala con un punto. Se è una domanda, usa il punto interrogativo. Capito?
		- CONCENTRATI su un dettaglio concreto: personaggi, conflitti, ambientazione specifica, azioni. Non importa che ogni dettaglio sia presente, solo gli elementi centrali.
		- UTILIZZA verbi d'azione e dettagli sensoriali specifici.
		- RIFORMULA le immagini e i concetti del testo originale con espressioni alternative che ne catturino l'essenza, evita copiare tutte le parole, aggettivi o immagini presenti nel testo originale.
		- ANTICIPA il contenuto del testo, ma non dichiarare tutto ciò che accade. Lascia spazio all'immaginazione.
		- OGNI descrizione deve essere unica e ancorata al contenuto effettivo.
		- La descrizione deve essere comprensibile e scritta in italiano corretto, semplice da capire senza usare intrecci strani o parole eccessivamente difficili.

		- Esempio che NON va bene: Morti invisibili urlano, mentre arabeschi e fiori lilla si intrecciano in un dilemma esistenziale, tra colpa e tecnologia che morde alla gola.
		- NON va bene perché: è difficile da capire, usa aggettivi generici e non è chiaro cosa succede. Inoltre ci sono troppi elementi che confondono il lettore.

		- Esempio che va BENE: Il tema della morte, contrapposto alla bellezza degli arabeschi e dei fiori, è al centro di un dilemma esistenziale che coinvolge la tecnologia e la colpa.
		- VA bene perché: è chiaro, semplice, usa dettagli specifici e azioni concrete, non è solo un insieme di elementi ma una descrizione di un testo, che lo introduce e esprime il significato.

		- In caso di testi particolarmente complessi, cerca di evidenziare il significato simbolico del test, al posto di quello letterale delle figure e delle immagini usate.
		" +
	  `;

      // Aggiungiamo istruzioni specifiche per i nuovi tag
      if (allowNewTags) {
        promptContent += `
	SISTEMA DI CLASSIFICAZIONE DEI CONTENUTI

		CATEGORIE [non modificabili]:
		Le categorie definiscono il formato del contenuto e sono già predefinite nel sistema:
		[Racconti, Poesie, Tutorial, Saggi, Pensieri, Recensioni, Interviste, Reportage, Guide]

		GENERI:
		I generi definiscono lo stile, l'approccio espressivo o il movimento letterario/artistico del contenuto, NON il suo formato o argomento specifico.

		Esempi CORRETTI di generi:
		${allGenres.map((g) => `- ${g.name}`).join("\n")}

		Esempi ERRATI di generi (da evitare):
		- poesia (è una categoria, non un genere)
		- racconto fantasy (usa solo "fantasy")
		- saggio filosofico (usa solo "filosofico")
		- amore (è un topic, non un genere)
		- tecnologia (è un topic, non un genere)
		- esistenzialismo (è un topic filosofico, usa "esistenzialista" come genere)

		TOPIC:
		I topic descrivono l'argomento specifico, il tema o la corrente di pensiero trattata nel contenuto.

		Esempi CORRETTI di topic:
		${allTopics.map((t) => `- ${t.name}`).join("\n")}

		DISTINZIONE CHIAVE GENERE vs TOPIC:
		- GENERE: come si esprime il contenuto (stile, approccio, movimento artistico)
		- TOPIC: di cosa parla il contenuto (argomento, tema, corrente di pensiero)

		REGOLA DI PRECEDENZA GENERE-TOPIC:
		Il genere ha la precedenza sul topic. Se viene scelto un genere specifico, non si può utilizzare lo stesso concetto come topic.
		Esempi:
		- Se il genere è "filosofico", non si può usare "filosofia" come topic, ma si devono scegliere topic più specifici come "etica", "metafisica", "epistemologia" o più generali come "libertà", "destino", "macchina".
		- Se il genere è "psicologico", non si può usare "psicologia" come topic, ma si devono usare topic come "trauma", "inconscio", "identità", "desiderio".
		- Se il genere è "storico", non si può usare "storia" come topic, ma si devono utilizzare topic specifici come "guerra mondiale", "rinascimento", "rivoluzione industriale".

		REGOLE IMPORTANTI per i nuovi generi/topic:
		- PRIVILEGIA parole singole. Evita l'uso di termini composti da due parole quando possibile.
		- Se devi usare due parole, NON usare trattini (es. "cultura pop" e non "cultura-pop")
		- Non devono essere termini troppo specifici o tecnici (es. "otorinolaringoiatra" è troppo specifico, "medicina" va bene)
		- Devono essere in italiano, ma possono includere parole straniere di uso comune
		- I termini devono essere di uso comune e comprensibili
		- Tutte le parole devono essere in minuscolo, senza maiuscole
		- Per i generi, usa la forma aggettivale quando possibile (es. "esistenzialista" non "esistenzialismo")
		- Per i topic, usa la forma sostantivale (es. "esistenzialismo" non "esistenzialista")
		- Se crei un nuovo genere o topic, contrassegnalo con un asterisco (*) prima del nome
		es. ["*cultura pop", "genere esistente"]

		ISTRUZIONI FONDAMENTALI:
		- Per i TOPIC: usa quelli esistenti quando appropriati, ma crea NUOVI TOPIC se descrivono meglio il testo
		- Il TOPIC deve essere immediatamente riconoscibile e comprensibile (es. "senso di colpa" è più chiaro di "colpa")
		- Per i GENERI: usa SEMPRE quelli esistenti e crea nuovi generi SOLO SE assolutamente necessario
		- Per i GENERI: privilegia generi che descrivolo le emozioni e lo stile del testo, non l'argomento (es. "romantico, horror, noir, giallo, fantascienza") sono preferibili a "filosofico, surrealismo, introspettivo, simbolismo")
		- Il genere surrealismo, come altri generi simili, è da usare con attenzione: è inerente, ma rischia di prendere il posto di altri generi che descrivono meglio il testo. Usa surrealismo SOLO se è la scelta più appropriata. O al massimo, usalo e aggiungi una seconda scelta. O usalo come seconda scelta. Ma privilegia generi che descrivono le emozioni che il testo trasmette, non lo stile.
		- Usa generi che descrivono lo stile quando il contenuto non ha un'emozione predominante o che non ha come scopo principale quello di trasmettere emozioni, come per esempio un saggio o un tutorial.
		- Non utilizzare necessariamente tutte le posizioni disponibili: includi SOLO le tag veramente rilevanti
		- Mai confondere CATEGORIE con GENERI o TOPIC
		- VIETATO usare un topic simile al genere. Se il genere è esistenzialista, non puoi usare esistenzialismo come topic. Se il genere è filosofico, non puoi usare filosofia come topic. Scegli topic più specifici o più generali.

		ESEMPI DI NUOVI TOPIC VALIDI:
		"architettura", "veganismo", "web", "pop"

		ESEMPI DI NUOVI TOPIC NON VALIDI:
		"cucina vegana => usare cucina e veganismo separatamente", "tecnologie informatiche => troppo generico"
		`;
      }

      if (genres.length > 0 || topics.length > 0) {
        // Caso con tag esistenti: ordina e integra
        promptContent += `
	${
    genres.length > 0
      ? `
	L'utente ha già selezionato i seguenti generi:
	${genres.join(", ")}
	
	Ordina questi generi IN ORDINE DI RILEVANZA, dal più al meno pertinente per il testo.
	${allowNewTags ? "Puoi suggerire fino a 3 generi in totale, ma USA SEMPRE I GENERI ESISTENTI a meno che non sia assolutamente necessario crearne di nuovi." : `Puoi anche suggerire fino a 3 generi in totale selezionando tra: ${genreNames.join(", ")}`}
	`
      : `Seleziona DA 1 A 3 generi IN ORDINE DI RILEVANZA ${allowNewTags ? "PRIVILEGIANDO GENERI ESISTENTI" : ""} tra: ${genreNames.join(", ")}`
  }
	
	${
    topics.length > 0
      ? `
	L'utente ha già selezionato i seguenti topic:
	${topics.join(", ")}
	
	Ordina questi topic IN ORDINE DI RILEVANZA, dal più al meno pertinente per il testo.
	${allowNewTags ? "Puoi suggerire fino a 3 topic in totale, usa i TOPIC ESISTENTI quando appropriati, ma creane di NUOVI se descrivono meglio il testo e possono essere riutilizzati (scalabili)." : `Puoi anche suggerire fino a 3 topic in totale selezionando tra: ${topicNames.join(", ")}`}
	`
      : `Seleziona DA 1 A 3 topic IN ORDINE DI RILEVANZA ${allowNewTags ? "Usa i TOPIC ESISTENTI quando appropriati, ma creane di NUOVI se descrivono meglio il testo e possono essere riutilizzati (scalabili)" : ""} tra: ${topicNames.join(", ")}`
  }
  `;
      } else {
        // Caso senza tag: seleziona e ordina
        promptContent += `
	3. ${
    allowNewTags
      ? "Seleziona DA 1 A 2 generi IN ORDINE DI RILEVANZA, USA SEMPRE I GENERI ESISTENTI a meno che non sia assolutamente necessario crearne di nuovi: "
      : "Seleziona DA 1 A 2 generi IN ORDINE DI RILEVANZA tra: "
  }${genreNames.join(", ")}
	4. ${
    allowNewTags
      ? "Seleziona DA 1 A 3 topic IN ORDINE DI RILEVANZA, usa i TOPIC ESISTENTI quando appropriati, ma creane di NUOVI se descrivono meglio il testo e possono essere riutilizzati (scalabili): "
      : "Seleziona DA 1 A 3 topic IN ORDINE DI RILEVANZA tra: "
  }${topicNames.join(", ")}
  `;
      }

      // Format di risposta JSON
      promptContent += `
  Rispondi SOLO con un oggetto JSON valido nel formato:
  
  {
	"description": "La descrizione qui",
	"generi": ["genere1", "genere2"],
	"topics": ["topic1", "topic2", "topic3"]
  }
  
  I generi e i topic DEVONO essere ordinati dal più al meno rilevante.
  RICORDA: Includi SOLO i generi e i topic veramente rilevanti, non è necessario utilizzare tutte e tre le posizioni disponibili.
  Contrassegna con un asterisco (*) i nuovi tag che suggerisci.
  IMPORTANTE: I generi e i topic devono essere formattati correttamente, in minuscolo e privilegiando parole singole. Se composti da due parole, NON usare trattini.
  
  Testo da analizzare (titolo: ${title}):
  ${textForAnalysis.substring(0, 8000)}
  `;
      // Chiamata OpenAI per l'analisi
      const systemPrompt =
        "Sei un assistente specializzato nell'analisi e categorizzazione di testi letterari in lingua italiana. " +
        "Il tuo compito è creare tag pertinenti, usando quelli esistenti quando appropriati, " +
        "ma creando NUOVI TOPIC (non generi) quando descrivono meglio il contenuto e possono essere riutilizzati. " +
        "IMPORTANTE: PRIVILEGIA l'uso di generi esistenti e crea nuovi generi SOLO quando assolutamente necessario. " +
        "I nuovi tag devono rispettare rigorosamente le regole di formattazione fornite. " +
        "Devono essere in italiano (o includere parole straniere di uso comune specificate), " +
        "formattati correttamente in minuscolo, preferibilmente costituiti da una singola parola. " +
        "Se composti da due parole, NON usare trattini. " +
        "NON è necessario utilizzare tutte e tre le posizioni disponibili per generi e topic: " +
        "includi SOLO quelli veramente rilevanti per il testo analizzato.";

      // Chiamata DeepSeek per l'analisi
      console.log("🔄 Chiamata DeepSeek API in corso...");
      const analysisResponse = await generateText({
        model: deepseek("deepseek-reasoner"), // Usa il modello con reasoning capabilities
        prompt: `${systemPrompt}\n\n${promptContent}`, // Combiniamo il promtp di sistema con quello dell'utente
        temperature: 0.7,
      });

      // Estrai il risultato dell'analisi
      const content = analysisResponse.text;
      console.log("✅ Risposta ricevuta da DeepSeek");

      // Puliamo la risposta per assicurarci che sia JSON valido
      let cleanContent = content;
      const jsonStart = content.indexOf("{");
      const jsonEnd = content.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanContent = content.substring(jsonStart, jsonEnd + 1);
        console.log("🧼 Pulizia JSON effettuata");
      }
      let analysis;

      // Processa la risposta JSON
      try {
        analysis = JSON.parse(cleanContent);
        console.log("🧠 Risposta AI:", analysis);

        // Il resto del tuo codice rimane invariato...
      } catch (error) {
        console.error("❌ Errore nel parsing della risposta JSON:", error);
        console.log("Risposta ricevuta:", content);
        throw new Error("Failed to parse AI response as JSON");
      }

      // Genera embedding per il testo
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: textForAnalysis.substring(0, 8000),
      });

      const embedding = embeddingResponse.data[0].embedding;

      // Processa i generi e topic suggeriti dall'AI
      let processedGenres = [];
      let processedTopics = [];

      // Assicuriamoci che analysis.generi e analysis.topics siano array
      const generiArray = Array.isArray(analysis.generi) ? analysis.generi : [];
      const topicsArray = Array.isArray(analysis.topics) ? analysis.topics : [];

      console.log("🔍 Generi proposti dall'AI:", generiArray);
      console.log("🔍 Topic proposti dall'AI:", topicsArray);

      // Processa i generi
      for (const genre of generiArray) {
        if (!genre) continue; // Salta valori null o undefined

        let genreName = genre;
        let isNew = false;

        // Controlla se è un nuovo genere (contrassegnato con *)
        if (typeof genre === "string" && genre.startsWith("*")) {
          genreName = genre.substring(1).trim().toLowerCase(); // Rimuovi asterisco, normalizza e converti in minuscolo
          isNew = true;

          // Se è un nuovo genere, aggiungiamolo alla lista dei nuovi tag creati
          if (allowNewTags) {
            console.log(`✅ Nuovo genere proposto dall'AI: ${genreName}`);
            newTagsCreated.genres.push(genreName);
          } else {
            // Se non consentiamo nuovi tag, ma l'AI ne ha suggerito uno, lo ignoriamo
            console.log(
              `⚠️ Nuovo genere ignorato (allowNewTags=false): ${genreName}`,
            );
            continue;
          }
        } else {
          // Normalizza comunque il genere esistente e converti in minuscolo
          genreName = genreName.trim().toLowerCase();
        }

        processedGenres.push(genreName);
      }

      // Processa i topic
      for (const topic of topicsArray) {
        if (!topic) continue; // Salta valori null o undefined

        let topicName = topic;
        let isNew = false;

        // Controlla se è un nuovo topic (contrassegnato con *)
        if (typeof topic === "string" && topic.startsWith("*")) {
          topicName = topic.substring(1).trim().toLowerCase(); // Rimuovi asterisco, normalizza e converti in minuscolo
          isNew = true;

          // Se è un nuovo topic, aggiungiamolo alla lista dei nuovi tag creati
          if (allowNewTags) {
            console.log(`✅ Nuovo topic proposto dall'AI: ${topicName}`);
            newTagsCreated.topics.push(topicName);
          } else {
            // Se non consentiamo nuovi tag, ma l'AI ne ha suggerito uno, lo ignoriamo
            console.log(
              `⚠️ Nuovo topic ignorato (allowNewTags=false): ${topicName}`,
            );
            continue;
          }
        } else {
          // Normalizza comunque il topic esistente e converti in minuscolo
          topicName = topicName.trim().toLowerCase();
        }

        processedTopics.push(topicName);
      }

      // Rimuovi duplicati
      processedGenres = [...new Set(processedGenres)];
      processedTopics = [...new Set(processedTopics)];

      // Limita a 3 elementi per tipo
      if (processedGenres.length > 3)
        processedGenres = processedGenres.slice(0, 3);
      if (processedTopics.length > 3)
        processedTopics = processedTopics.slice(0, 3);

      // Verifica se abbiamo tag validi
      if (processedGenres.length === 0) {
        console.warn(
          "⚠️ Nessun genere valido trovato dall'AI, inserisco un default",
        );
        processedGenres = ["non-classificato"];
      }

      if (processedTopics.length === 0) {
        console.warn(
          "⚠️ Nessun topic valido trovato dall'AI, inserisco un default",
        );
        processedTopics = ["generale"];
      }

      console.log("✅ Generi processati:", processedGenres);
      console.log("✅ Topic processati:", processedTopics);

      // Salva i risultati dell'analisi AI
      aiAnalysisResults = {
        description: analysis.description,
        categoria: analysis.categoria,
        generi: processedGenres,
        topics: processedTopics,
        embedding: embedding,
      };

      console.log("✅ Analisi AI completata:", aiAnalysisResults);
      console.log("🏷️ Nuovi tag creati:", newTagsCreated);

      // Usa i generi e topic dall'AI se non sono stati forniti dall'utente
      if (genres.length === 0) {
        genres = processedGenres;
      } else {
        // Riordina i generi esistenti in base all'analisi AI
        genres = rearrangeByAIPreference(genres, processedGenres);
      }

      if (topics.length === 0) {
        topics = processedTopics;
      } else {
        // Riordina i topic esistenti in base all'analisi AI
        topics = rearrangeByAIPreference(topics, processedTopics);
      }
    }

    // ✅ Converti i nomi delle categorie, generi e topic in ObjectId
    const categoryIds = await Promise.all(
      categories.map(async (categoryName) => {
        // Cerca la categoria nel database (case insensitive)
        // Assicurati che il nome sia in minuscolo
        const nameLowercase = categoryName.toLowerCase();

        let category = await Category.findOne({
          name: nameLowercase,
        });

        // Se la categoria non esiste, creala (con nome in minuscolo)
        if (!category) {
          console.log(
            `⚠️ Categoria non trovata nel database: "${nameLowercase}", creazione automatica...`,
          );
          category = await Category.create({ name: nameLowercase });
          console.log(`✅ Nuova categoria creata: ${nameLowercase}`);
        } else {
          console.log(
            `✅ Categoria trovata nel database: ${category.name} (ID: ${category._id})`,
          );
        }

        return category._id;
      }),
    );

    // Trova o crea record per i generi con informazioni di rilevanza
    const genresWithRelevance = await Promise.all(
      genres.map(async (genreName: string, index: number) => {
        // Assicurati che il nome sia in minuscolo
        const nameLowercase = genreName.toLowerCase();

        let genre = await Genre.findOne({ name: nameLowercase });

        if (!genre) {
          // Crea un nuovo genere se non esiste (con nome in minuscolo)
          genre = await Genre.create({
            name: nameLowercase,
            totalArticles: 0,
            categoryCounts: [],
            topicCounts: [],
            authorCounts: [],
          });
          console.log(`✅ Nuovo genere creato nel database: ${nameLowercase}`);
        }

        return {
          id: genre._id,
          relevance: index + 1, // 1 = più rilevante, 2 = secondo più rilevante, ecc.
        };
      }),
    );

    // Trova o crea record per i topic con informazioni di rilevanza
    const topicsWithRelevance = await Promise.all(
      topics.map(async (topicName: string, index: number) => {
        // Assicurati che il nome sia in minuscolo
        const nameLowercase = topicName.toLowerCase();

        let topic = await Topic.findOne({ name: nameLowercase });

        if (!topic) {
          // Crea un nuovo topic se non esiste (con nome in minuscolo)
          topic = await Topic.create({
            name: nameLowercase,
            totalArticles: 0,
            categoryCounts: [],
            genreCounts: [],
            authorCounts: [],
          });
          console.log(`✅ Nuovo topic creato nel database: ${nameLowercase}`);
        }

        return {
          id: topic._id,
          relevance: index + 1,
        };
      }),
    );

    console.log("🔹 ID e rilevanza:", {
      categoryIds,
      genresWithRelevance,
      topicsWithRelevance,
    });

    // ✅ Crea un nuovo articolo con gli ID e i dati dell'analisi AI
    const newArticle = await Article.create({
      title,
      coverImage,
      markdownPath,
      author,
      categories: categoryIds,
      genres: genresWithRelevance,
      topics: topicsWithRelevance,
      aiDescription: aiAnalysisResults?.description,
      embedding: aiAnalysisResults?.embedding,
    });

    console.log("✅ Articolo salvato con successo:", newArticle);

    // Aggiorna le statistiche del modello per il nuovo articolo
    try {
      console.log("🔄 Avvio aggiornamento statistiche...");
      const statsResult = await updateModelStats(newArticle._id);
      console.log("✅ Aggiornamento statistiche completato:", statsResult);
    } catch (statsError) {
      console.error(
        "⚠️ Errore nell'aggiornamento delle statistiche:",
        statsError,
      );
      // Continuiamo comunque anche se l'aggiornamento delle statistiche fallisce
    }

    // Aggiungi informazioni sui nuovi tag creati nella risposta
    return NextResponse.json(
      {
        message: "Article created",
        article: newArticle,
        newTagsCreated: newTagsCreated,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("❌ Errore API /api/articles (POST):", error.message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// Funzione di utilità per riordinare elementi in base all'analisi AI
function rearrangeByAIPreference(
  userItems: string[],
  aiItems: string[],
): string[] {
  // Prima ordina gli elementi dell'utente in base all'ordine AI
  const reordered = [...userItems].sort((a, b) => {
    const aIndex = aiItems.indexOf(a);
    const bIndex = aiItems.indexOf(b);

    // Se un elemento non è presente nell'analisi AI, metterlo alla fine
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;

    return aIndex - bIndex;
  });

  // Aggiungi elementi suggeriti dall'AI che l'utente non ha selezionato
  // ma limita il totale a 3
  const suggestedItems = aiItems.filter((item) => !userItems.includes(item));
  const combined = [...reordered, ...suggestedItems];

  return combined.slice(0, 3); // Limita a 3 elementi
}
