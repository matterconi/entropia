import React from "react";

import SectionHeader from "@/app/(root)/categorie/[categoria]/SectionHeader";
import NoArticlesScreen from "@/components/feedback-screens/NoArticlesScreen";
import Filters from "@/components/filters/Filters";
import LocalSearch from "@/components/post-page/LocalSearch";
import ArticlesGrid from "@/components/related-post/PostGrid";

import FeaturedPost from "./FeaturedPostSlider";

async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  // Processa i parametri di ricerca
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

  // Aggiungiamo il parametro "limit" per caricare solo le prime 8 serie inizialmente
  filteredParams.limit = "8";

  const queryString = new URLSearchParams(filteredParams).toString();
  const hasFilters = Object.keys(resolvedSearchParams).length > 0;

  // URL per ottenere tutte le serie
  const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/series`;

  // URL filtrato per la griglia di serie
  const filteredUrl = hasFilters
    ? `${baseUrl}?${queryString}`
    : `${baseUrl}?${new URLSearchParams({ limit: "8" }).toString()}`;

  // Fetch delle serie: originali per Featured e filtrate per la griglia
  let allSeries = [];
  let filteredSeries = [];

  try {
    if (hasFilters) {
      // Se ci sono filtri, eseguiamo entrambe le query in parallelo
      const [originalRes, filteredRes] = await Promise.all([
        fetch(baseUrl),
        fetch(filteredUrl),
      ]);

      if (!originalRes.ok || !filteredRes.ok) {
        throw new Error("Errore nel recupero delle serie");
      }

      const originalData = await originalRes.json();
      const filteredData = await filteredRes.json();

      allSeries = originalData.series;
      filteredSeries = filteredData.series;
    } else {
      // Se non ci sono filtri, eseguiamo una query per tutte le serie
      const response = await fetch(baseUrl);

      if (!response.ok) {
        throw new Error("Errore nel recupero delle serie");
      }

      const data = await response.json();
      allSeries = data.series;
      filteredSeries = allSeries;
    }
  } catch (error) {
    console.error("❌ Errore nel fetch delle serie:", error);
  }

  // Funzione per determinare il titolo e il messaggio del NoArticlesScreen
  const getNoSeriesContent = (isFiltered = false) => {
    if (isFiltered) {
      return {
        title: "Nessun risultato trovato",
        message:
          "La tua ricerca non ha prodotto risultati. Prova a modificare i filtri o la query di ricerca.",
        actionText: "Reimposta filtri",
      };
    } else {
      return {
        title: "Non ci sono ancora serie disponibili",
        message:
          "Non abbiamo ancora serie pubblicate. Torna a visitarci presto per scoprire nuovi contenuti!",
        actionText: "",
        onAction: null,
      };
    }
  };

  // Se non ci sono serie in assoluto, mostriamo solo la schermata NoArticlesScreen
  if (allSeries.length === 0) {
    const noSeriesContent = getNoSeriesContent(false);
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <NoArticlesScreen
          title={noSeriesContent.title}
          message={noSeriesContent.message}
          actionText={noSeriesContent.actionText}
        />
      </div>
    );
  }

  // Prepariamo i dati delle serie per mostrarli come se fossero articoli
  // (adattandoli al formato atteso da FeaturedPost e ArticlesGrid)
  const seriesAsPosts = allSeries.map((serie) => ({
    id: serie.id,
    title: serie.title,
    slug: serie.slug,
    excerpt: serie.description,
    coverImage: serie.coverImage,
    author: serie.author,
    categories: serie.categories || [],
    genres: serie.genres || [],
    topics: serie.topics || [],
    date: serie.createdAt,
    isComplete: serie.isComplete,
    totalChapters: serie.totalChapters,
    description: serie.aiDescription,
    link: `/percorsi/serie/${serie.slug}`, // Link alla pagina dettaglio della serie
  }));

  const filteredSeriesAsPosts = filteredSeries.map((serie) => ({
    id: serie.id,
    title: serie.title,
    slug: serie.slug,
    excerpt: serie.description,
    coverImage: serie.coverImage,
    author: serie.author,
    categories: serie.categories || [],
    genres: serie.genres || [],
    topics: serie.topics || [],
    date: serie.createdAt,
    isComplete: serie.isComplete,
    totalChapters: serie.totalChapters,
    description: serie.aiDescription,
    link: `/percorsi/serie/${serie.slug}`, // Link alla pagina dettaglio della serie
  }));

  console.log(filteredSeriesAsPosts);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mx-12 relative w-screen bg-background">
        <SectionHeader title="Serie" />
        {/* Usiamo le serie originali (non filtrate) per il componente Featured */}
        <FeaturedPost posts={seriesAsPosts.slice(0, 3)} isNew />
      </div>

      <h1 className="text-center text-4xl text-gradient font-title p-4 mt-8 font-semibold">
        Tutte le Serie
      </h1>

      <div className="w-full flex items-center justify-center px-12 mb-8 mt-6">
        <LocalSearch placeholder="Cerca una serie..." />
      </div>

      <div className="w-full flex items-center justify-center">
        <Filters />
      </div>

      {/* Sezione serie filtrate */}
      <div className="w-full max-md:px-8 px-8 mt-4">
        {filteredSeriesAsPosts.length > 0 ? (
          <ArticlesGrid
            initialPosts={filteredSeriesAsPosts.slice(0, 3)}
            baseUrl={baseUrl}
            queryString={queryString}
          />
        ) : (
          // Se ci sono serie in generale ma nessuna corrisponde ai filtri applicati
          <div className="w-full py-6">
            <NoArticlesScreen
              title={getNoSeriesContent(true).title}
              message={getNoSeriesContent(true).message}
              actionText={getNoSeriesContent(true).actionText}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Page;
