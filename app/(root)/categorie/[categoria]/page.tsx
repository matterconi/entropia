import React from "react";

import FeaturedPost from "@/components/shared/FeaturedPostSlider";
import Filters from "@/components/shared/Filters";
import LocalSearch from "@/components/shared/LocalSearch";
import RelatedPostCard from "@/components/shared/RelatedPostCard";
import SectionHeader from "@/components/shared/SectionHeader";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { categories as categorie } from "@/data/data";

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

const page = async ({
  params,
  searchParams,
}: {
  params: { categoria: string };
  searchParams: URLSearchParams;
}) => {
  const { categoria } = params;

  if (!categoria || !(categoria in categories)) {
    return (
      <div>
        <h1>Categoria non trovata!</h1>
      </div>
    );
  }

  const section = categories[categoria as keyof typeof categories];

  const queryString = new URLSearchParams(await searchParams).toString();

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/categorie/${categoria}${queryString ? `?${queryString}` : ""}`;

  console.log("🔍 Fetching URL:", url);

  // ✅ Fetch articoli dinamicamente dal database
  let posts = [];
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("Errore nel recupero degli articoli");
    }
    const data = await res.json();
    posts = data.articles;
  } catch (error) {
    console.error("❌ Errore nel fetch degli articoli:", error);
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mx-12 relative w-screen bg-background">
        <SectionHeader section={section - 1} type={categorie} />
        {posts.length > 0 ? (
          <FeaturedPost posts={posts} isNew />
        ) : (
          <p>Nessun articolo trovato</p>
        )}
      </div>

      {/* Slider con il pulsante per il menu */}
      <h1 className="text-4xl text-gradient font-title p-4 mt-8 font-semibold">
        {`${articles[categoria]} ${categoria}`}
      </h1>
      <div className="w-full flex items-center justify-center px-12 mb-8 mt-6">
        <LocalSearch placeholder="Cerca un articolo..." />
      </div>
      <div className="w-full flex items-center justify-center">
        <Filters />
      </div>
      <div className="max-md:px-6 px-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 w-full mt-4">
        {posts.length > 0 ? (
          posts.map((post, i) => <RelatedPostCard key={i} post={post} />)
        ) : (
          <p className="text-gray-500">Nessun articolo disponibile</p>
        )}
      </div>
      <div className="w-full flex items-center justify-center my-12 px-12">
        <RainbowButton className="w-full">
          <p>Leggi tutti i racconti</p>
        </RainbowButton>
      </div>
    </div>
  );
};

export default page;
