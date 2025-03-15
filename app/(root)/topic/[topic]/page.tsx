import React from "react";

import SectionHeader from "@/app/(root)/categorie/[categoria]/SectionHeader";
import FeaturedPost from "@/components/featured-post/FeaturedPostSlider";
import NoArticlesScreen from "@/components/feedback-screens/NoArticlesScreen";
import Filters from "@/components/filters/Filters";
import LocalSearch from "@/components/post-page/LocalSearch";
import ArticlesGrid from "@/components/related-post/PostGrid"; // Importa il nuovo componente
import { topics as top } from "@/data/data";
import { TopicKeys } from "@/types";

// Topic mapping for section identification
const topicsArr = {
  filosofia: 1,
  esistenzialismo: 2,
  cinema: 3,
  musica: 4,
  arte: 5,
  politica: 6,
  psicologia: 7,
  società: 8,
  storia: 9,
  "scienza-e-tecnologia": 10,
  spiritualità: 11,
  letteratura: 12,
  "cultura-pop": 13,
};

// Prepositions for Italian grammar
const prepositions = {
  filosofia: "di ",
  esistenzialismo: "di ",
  cinema: "di ",
  musica: "di ",
  arte: "d'",
  politica: "di ",
  psicologia: "di ",
  società: "della ",
  storia: "di ",
  "scienza-e-tecnologia": "di ",
  spiritualità: "della ",
  letteratura: "di ",
  "cultura-pop": "della ",
};

async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ topic: keyof typeof prepositions }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  // Risolviamo le Promise
  const resolvedParams = await params;
  const { topic } = resolvedParams;
  console.log("topic", topic);

  if (!topic || !(topic in topicsArr)) {
    return (
      <div>
        <h1>Topic non trovato!</h1>
      </div>
    );
  }

  const section = topicsArr[topic as keyof typeof topicsArr];

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

  // URL di base per ottenere tutti i post senza filtri
  const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/topic/${topic}`;

  // URL filtrato per la griglia di post
  const filteredUrl = hasFilters
    ? `${baseUrl}?${queryString}`
    : `${baseUrl}?${new URLSearchParams({ limit: "8" }).toString()}`;

  console.log("🔍 Fetching URLs:", { baseUrl, filteredUrl });

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

      console.log(
        `✅ Fetched ${originalPosts.length} original posts and ${filteredPosts.length} filtered posts`,
      );
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

      console.log(
        `✅ Fetched ${originalPosts.length} original posts and ${filteredPosts.length} initial limited posts`,
      );
    }
  } catch (error) {
    console.error("❌ Errore nel fetch degli articoli:", error);
  }

  // Get proper display name for the topic by converting URL format to display format
  const topicName = top[section - 1]?.title || topic.split("-").join(" ");

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
        title: `Purtroppo non ci sono ancora contenuti ${prepositions[topic]}${topicName} disponibili`,
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
        <SectionHeader section={section - 1} type={top} />
        {/* Usiamo i post originali (non filtrati) per il componente Featured */}
        <FeaturedPost posts={originalPosts} isNew />
      </div>

      {/* Slider con il pulsante per il menu */}
      <h1 className="text-center text-4xl text-gradient font-title p-4 mt-8 font-semibold">
        {`Tutti i contenuti ${prepositions[topic]}${topicName}`}
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
            type={topic as TopicKeys}
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
