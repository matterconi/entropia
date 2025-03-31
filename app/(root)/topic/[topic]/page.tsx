import React from "react";

import SectionHeader from "@/app/(root)/categorie/[categoria]/SectionHeader";
import FeaturedPost from "@/components/featured-post/FeaturedPostSlider";
import NoArticlesScreen from "@/components/feedback-screens/NoArticlesScreen";
import Filters from "@/components/filters/Filters";
import LocalSearch from "@/components/post-page/LocalSearch";
import ArticlesGrid from "@/components/related-post/PostGrid";
import Topic from "@/database/Topic";
import dbConnect from "@/lib/mongoose";
import { denormalizeSlug } from "@/lib/normalizeSlug"; // Importa la funzione di processamento slug
import { TopicKeys } from "@/types";

// Versione dinamica che otterrà i topic dal database
async function getTopics() {
  await dbConnect();
  // Fetch di tutti i topic dal database
  const topics = await Topic.find({}).select("_id name").lean();
  return topics;
}

async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ topic: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  // Risolviamo le Promise
  const resolvedParams = await params;
  const { topic: rawTopic } = resolvedParams;

  // Processa lo slug del topic per gestire URL-encoding e accenti
  const topicSlug = denormalizeSlug(rawTopic);

  // Otteniamo i topic disponibili dal database
  const topics = await getTopics();

  // Convertiamo l'array dei topic in un formato che possiamo usare facilmente
  // Creiamo due mappe: una normale e una normalizzata
  const topicsMap = {};
  const normalizedTopicsMap = {};

  topics.forEach((t) => {
    // Mappa standard
    const slug = t.name.toLowerCase().replace(/\s+/g, "-");
    topicsMap[slug] = t._id.toString();
  });

  // Convertiamo anche nel formato inverso (id -> nome) per la visualizzazione
  const topicNames = topics.reduce(
    (acc, t) => {
      acc[t._id.toString()] = t.name;
      return acc;
    },
    {} as Record<string, string>,
  );

  // Verifichiamo se il topic richiesto esiste (controllo sia nella mappa standard che in quella normalizzata)
  const topicExists =
    topicSlug in topicsMap || topicSlug in normalizedTopicsMap;

  if (!rawTopic || !topicExists) {
    console.log("❌ Topic non trovato:", topicSlug);
    console.log("🔍 Topic disponibili:", Object.keys(topicsMap));
    console.log(
      "🔍 Topic normalizzati disponibili:",
      Object.keys(normalizedTopicsMap),
    );

    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Topic non trovato!</h1>
        <p className="mt-4">
          Il topic richiesto non esiste nel nostro database.
        </p>
        <pre className="bg-gray-100 p-4 rounded text-sm">
          Richiesto: {topicSlug}
        </pre>
      </div>
    );
  }

  // Otteniamo l'ID del topic dal mapping (controlla prima la mappa normalizzata)
  const topicId = normalizedTopicsMap[topicSlug] || topicsMap[topicSlug];

  // Otteniamo il nome del topic per la visualizzazione
  const rawTopicDisplayName =
    Object.values(topics).find((t) => t._id.toString() === topicId)?.name ||
    decoded.split("-").join(" "); // Usa il nome decodificato invece del normalizzato

  const topicDisplayName =
    rawTopicDisplayName.charAt(0).toUpperCase() + rawTopicDisplayName.slice(1);

  const resolvedSearchParams = await searchParams;
  const filteredParams = Object.entries(resolvedSearchParams).reduce(
    (acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, string>,
  );

  // Aggiungiamo il parametro "limit" per caricare solo i primi 8 articoli inizialmente
  filteredParams.limit = "8";

  const queryString = new URLSearchParams(filteredParams).toString();
  const hasFilters = Object.keys(resolvedSearchParams).length > 0;

  // URL di base per ottenere tutti i post senza filtri - usa rawTopic per preservare l'URL originale
  const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/topic/${rawTopic}`;

  // URL filtrato per la griglia di post
  const filteredUrl = hasFilters
    ? `${baseUrl}?${queryString}`
    : `${baseUrl}?${new URLSearchParams({ limit: "8" }).toString()}`;

  // Fetch degli articoli: originali per Featured e filtrati per la griglia
  let originalPosts = [];
  let filteredPosts = [];

  try {
    if (hasFilters) {
      // Se ci sono filtri, eseguiamo entrambe le query in parallelo
      const [originalRes, filteredRes] = await Promise.all([
        fetch(baseUrl),
        fetch(filteredUrl),
      ]);

      if (!originalRes.ok || !filteredRes.ok) {
        throw new Error("Errore nel recupero degli articoli");
      }

      const originalData = await originalRes.json();
      const filteredData = await filteredRes.json();

      originalPosts = originalData.articles;
      filteredPosts = filteredData.articles;
    } else {
      // Se non ci sono filtri, eseguiamo due query: una per tutti gli articoli (featured) e una limitata per la griglia
      const [fullRes, limitedRes] = await Promise.all([
        fetch(baseUrl),
        fetch(filteredUrl),
      ]);

      if (!fullRes.ok || !limitedRes.ok) {
        throw new Error("Errore nel recupero degli articoli");
      }

      const fullData = await fullRes.json();
      const limitedData = await limitedRes.json();

      originalPosts = fullData.articles;
      filteredPosts = limitedData.articles;
    }
  } catch (error) {
    console.error("❌ Errore nel fetch degli articoli:", error);
  }

  // Funzione per determinare il titolo e il messaggio del NoArticlesScreen
  const getNoArticlesContent = (isFiltered = false) => {
    if (isFiltered) {
      return {
        title: "Nessun risultato trovato",
        message:
          "La tua ricerca non ha prodotto risultati. Prova a modificare i filtri o la query di ricerca.",
        actionText: "Reimposta filtri",
      };
    } else {
      return {
        title: `Purtroppo non ci sono ancora contenuti in ${topicDisplayName}`,
        message: `Non abbiamo ancora articoli per questo topic. Torna a visitarci presto per scoprire nuovi contenuti!`,
        actionText: "",
        onAction: null,
      };
    }
  };

  // Se non ci sono articoli in assoluto, mostriamo solo la schermata NoArticlesScreen
  if (originalPosts.length === 0) {
    const noArticlesContent = getNoArticlesContent(false);
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <NoArticlesScreen
          title={noArticlesContent.title}
          message={noArticlesContent.message}
          actionText={noArticlesContent.actionText}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mx-12 relative w-screen bg-background">
        {/* Invece di usare l'indice per SectionHeader, passiamo il titolo direttamente */}
        <SectionHeader title={topicDisplayName} />
        {/* Usiamo i post originali (non filtrati) per il componente Featured */}
        <FeaturedPost posts={originalPosts} isNew />
      </div>

      {/* Titolo aggiornato con preposizione neutrale "in" */}
      <h1 className="text-center text-4xl text-gradient font-title p-4 mt-8 font-semibold">
        {`Tutto in ${topicDisplayName}`}
      </h1>

      <div className="w-full flex items-center justify-center px-12 mb-8 mt-6">
        <LocalSearch placeholder="Cerca un articolo..." />
      </div>

      <div className="w-full flex items-center justify-center">
        <Filters />
      </div>

      {/* Sezione articoli filtrati */}
      <div className="w-full max-md:px-8 px-8 mt-4">
        {filteredPosts.length > 0 ? (
          <ArticlesGrid
            initialPosts={filteredPosts}
            type={topicSlug as TopicKeys}
            baseUrl={baseUrl}
            queryString={queryString}
          />
        ) : (
          // Se ci sono articoli in generale ma nessuno corrisponde ai filtri applicati
          <div className="w-full py-6">
            <NoArticlesScreen
              title={getNoArticlesContent(true).title}
              message={getNoArticlesContent(true).message}
              actionText={getNoArticlesContent(true).actionText}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Page;
