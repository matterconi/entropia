import React from "react";

import SectionHeader from "@/app/(root)/categorie/[categoria]/SectionHeader";
import FeaturedPost from "@/components/featured-post/FeaturedPostSlider";
import NoArticlesScreen from "@/components/feedback-screens/NoArticlesScreen";
import Filters from "@/components/filters/Filters";
import LocalSearch from "@/components/post-page/LocalSearch";
import ArticlesGrid from "@/components/related-post/PostGrid"; // Importa il nuovo componente
import { categories as categorie } from "@/data/data";
import { CategoryKeys } from "@/types";

const categories: { [key: string]: number } = {
  racconti: 1,
  poesie: 2,
  saggi: 3,
  tutorial: 4,
  recensioni: 5,
  viaggi: 6,
  pensieri: 7,
};

const articles = {
  racconti: "Tutti i ",
  poesie: "Tutte le ",
  saggi: "Tutti i ",
  tutorial: "Tutti i ",
  recensioni: "Tutte le ",
  viaggi: "Tutti i ",
  pensieri: "Tutti i ",
};

async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ categoria: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  // Risolviamo le Promise
  const resolvedParams = await params;
  const { categoria } = resolvedParams;
  if (!categoria || !(categoria in categories)) {
    return (
      <div>
        <h1>Categoria non trovata!</h1>
      </div>
    );
  }

  const section = categories[categoria as keyof typeof categories];

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
  const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/categorie/${categoria}`;

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
        title: `Purtroppo non ci sono ancora ${categoria} disponibili`,
        message: `Questa categoria non contiene ancora contenuti. Torna a visitarci presto per nuov${categoria === "poesie" || categoria === "recensioni" ? "e" : "i"} ${categoria}.`,
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
        <SectionHeader section={section - 1} type={categorie} />
        {/* Usiamo i post originali (non filtrati) per il componente Featured */}
        <FeaturedPost posts={originalPosts} isNew />
      </div>

      {/* Slider con il pulsante per il menu */}
      <h1 className="text-4xl text-gradient font-title p-4 mt-8 font-semibold">
        {`${articles[categoria as CategoryKeys]} ${categoria}`}
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
            type={categoria as CategoryKeys}
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
