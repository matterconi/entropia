import React from "react";

import SectionHeader from "@/app/(root)/categorie/[categoria]/SectionHeader";
import FeaturedPost from "@/components/featured-post/FeaturedPostSlider";
import NoArticlesScreen from "@/components/feedback-screens/NoArticlesScreen";
import Filters from "@/components/filters/Filters";
import LocalSearch from "@/components/post-page/LocalSearch";
import ArticlesGrid from "@/components/related-post/PostGrid";
import Genre from "@/database/Genre";
import dbConnect from "@/lib/mongoose";
import { GenreKeys } from "@/types";

// Funzione per ottenere dinamicamente i generi dal database
async function getGenres() {
  await dbConnect();
  // Fetch di tutti i generi dal database
  const genres = await Genre.find({}).select("_id name").lean();
  return genres;
}

async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ genere: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  // Risolviamo le Promise
  const resolvedParams = await params;
  const { genere } = resolvedParams;

  // Otteniamo i generi disponibili dal database
  const genres = await getGenres();

  // Convertiamo l'array dei generi in un formato che possiamo usare facilmente
  // Utilizziamo una struttura {slug: id} per il mapping, dove slug è il nome convertito in formato URL
  const genresMap = genres.reduce(
    (acc, g) => {
      // Convertiamo il nome del genere in un formato URL (lowercase, spazi -> trattini)
      const slug = g.name.toLowerCase().replace(/\s+/g, "-");
      acc[slug] = g._id.toString();
      return acc;
    },
    {} as Record<string, string>,
  );

  // Convertiamo anche nel formato inverso (id -> nome) per la visualizzazione
  const genreNames = genres.reduce(
    (acc, g) => {
      acc[g._id.toString()] = g.name;
      return acc;
    },
    {} as Record<string, string>,
  );

  // Verifichiamo se il genere richiesto esiste
  if (!genere || !(genere in genresMap)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold">Genere non trovato!</h1>
        <p className="mt-4">
          Il genere richiesto non esiste nel nostro database.
        </p>
      </div>
    );
  }

  // Otteniamo l'ID del genere dal mapping
  const genreId = genresMap[genere];

  // Otteniamo il nome del genere per la visualizzazione
  const rawGenreDisplayName =
    Object.values(genres).find((g) => g._id.toString() === genreId)?.name ||
    genere.split("-").join(" ");
  const genreDisplayName =
    rawGenreDisplayName.charAt(0).toUpperCase() + rawGenreDisplayName.slice(1);

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
  const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/generi/${genere}`;

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
        title: `Purtroppo non ci sono ancora contenuti in ${genreDisplayName} disponibili`,
        message: `Non abbiamo ancora articoli per questo genere. Torna a visitarci presto per scoprire nuovi contenuti!`,
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
        {/* Passiamo il titolo direttamente a SectionHeader */}
        <SectionHeader title={genreDisplayName} />
        {/* Usiamo i post originali (non filtrati) per il componente Featured */}
        <FeaturedPost posts={originalPosts} isNew />
      </div>

      {/* Slider con il pulsante per il menu */}
      <h1 className="text-center text-4xl text-gradient font-title p-4 mt-8 font-semibold">
        {`Tutto in ${genreDisplayName}`}
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
            type={genere as GenreKeys}
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
