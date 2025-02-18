import React from "react";

import FeaturedPost from "@/components/shared/FeaturedPostSlider";
import Filters from "@/components/shared/Filters";
import LocalSearch from "@/components/shared/LocalSearch";
import RelatedPostCard from "@/components/shared/RelatedPostCard";
import SectionHeader from "@/components/shared/SectionHeader";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { genres as generi } from "@/data/data";
import { Post } from "@/types";

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

const page = async ({
  params,
}: {
  params: Promise<{ genere: keyof typeof plurals }>;
}) => {
  // Aspettiamo la risoluzione di params
  const resolvedParams = await params;
  const { genere } = resolvedParams;

  if (!genere || !(genere in genres)) {
    return (
      <div>
        <h1>Genere non trovato!</h1>
      </div>
    );
  }

  const section = genres[genere];

  // ✅ Fetch degli articoli di un genere specifico
  let articles = [];
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/generi/${genere}`,
    );

    if (!res.ok) {
      throw new Error("Errore nel recupero degli articoli");
    }

    const data = await res.json();
    articles = data.articles;
  } catch (error) {
    console.error("❌ Errore nel fetch degli articoli:", error);
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mx-12 relative w-screen bg-background">
        <SectionHeader section={section - 1} type={generi} />
        <FeaturedPost posts={articles} isNew />
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
      <div className="max-md:px-6 px-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 w-full mt-4">
        {articles.map((post: Post, i: number) => (
          <RelatedPostCard key={i} post={post} />
        ))}
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
