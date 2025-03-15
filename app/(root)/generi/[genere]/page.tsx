import React from "react";

import SectionHeader from "@/app/(root)/categorie/[categoria]/SectionHeader";
import FeaturedPost from "@/components/featured-post/FeaturedPostSlider";
import NoArticlesScreen from "@/components/feedback-screens/NoArticlesScreen";
import Filters from "@/components/filters/Filters";
import LocalSearch from "@/components/post-page/LocalSearch";
import ArticlesGrid from "@/components/related-post/PostGrid"; // Importa il nuovo componente
import { genres as generi } from "@/data/data";
import { GenreKeys } from "@/types";

const genres: { [key: string]: number } = {
  romantico: 1,
  azione: 2,
  avventura: 3,
  fantasy: 4,
  fantascienza: 5,
  horror: 6,
  giallo: 7,
  drammatico: 8,
  storico: 9,
};

const plurals = {
  romantico: "romantici",
  azione: "d'azione",
  avventura: "di avventura",
  fantasy: "fantasy",
  fantascienza: "di fantascienza",
  horror: "horror",
  giallo: "gialli",
  drammatico: "drammatici",
  storico: "storici",
};

async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ genere: keyof typeof plurals }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  // Aspettiamo la risoluzione di params
  const resolvedParams = await params;
  const { genere } = resolvedParams;
  console.log("genere", genere);

  if (!genere || !(genere in genres)) {
    return (
      <div>
        <h1>Genere non trovato!</h1>
      </div>
    );
  }

  const section = genres[genere];

  // Gestione dei parametri di ricerca
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
        title: `Purtroppo non ci sono ancora contenuti ${plurals[genere]} disponibili`,
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
        <SectionHeader section={section - 1} type={generi} />
        {/* Usiamo i post originali (non filtrati) per il componente Featured */}
        <FeaturedPost posts={originalPosts} isNew />
      </div>

      {/* Slider con il pulsante per il menu */}
      <h1 className="text-center text-4xl text-gradient font-title p-4 mt-8 font-semibold">
        {`Tutti i contenuti ${plurals[genere]}`}
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
