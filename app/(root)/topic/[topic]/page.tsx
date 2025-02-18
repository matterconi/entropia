import Image from "next/image";
import React from "react";

import FeaturedPost from "@/components/shared/FeaturedPostSlider";
import Filters from "@/components/shared/Filters";
import LocalSearch from "@/components/shared/LocalSearch";
import RelatedPostCard from "@/components/shared/RelatedPostCard";
import SectionHeader from "@/components/shared/SectionHeader";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { topic as top } from "@/data/data";
import { Post } from "@/types";

const topicsArr: { [key: string]: number } = {
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

const prepositions = {
  filosofia: "di ",
  esistenzialismo: "di ",
  cinema: "di ",
  musica: "di ",
  arte: "d'",
  politica: "di ",
  psicologia: "di ",
  società: "di ",
  storia: "di ",
  "scienza-e-tecnologia": "di ",
  spiritualità: "di ",
  letteratura: "di ",
  "cultura-pop": "di ",
};

const page = async ({
  params,
}: {
  params: { topic: keyof typeof prepositions };
}) => {
  const { topic } = params;

  if (!topic || !(topic in topicsArr)) {
    return (
      <div>
        <h1>Topic non trovato!</h1>
      </div>
    );
  }

  const section = topicsArr[topic as keyof typeof topicsArr];

  // 🔍 Fetch degli articoli dalla route API
  let posts = [];
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/topic/${topic}`,
    );
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
        <SectionHeader section={section - 1} type={top} />
        {posts.length > 0 && <FeaturedPost posts={posts} isNew />}
      </div>

      {/* Slider con il pulsante per il menu */}
      <h1 className="text-center text-4xl text-gradient font-title p-4 mt-8 font-semibold">
        {`Tutti i contenuti ${prepositions[topic]}${topic.split("-").join(" ")}`}
      </h1>

      <div className="w-full flex items-center justify-center px-12 mb-8 mt-6">
        <LocalSearch placeholder="Cerca un articolo..." />
      </div>

      <div className="w-full flex items-center justify-center">
        <Filters />
      </div>

      <div className="max-md:px-6 px-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 w-full mt-4">
        {posts.length > 0 ? (
          posts.map((post: Post, i: number) => (
            <RelatedPostCard key={i} post={post} />
          ))
        ) : (
          <p className="text-center text-lg mt-8">
            Nessun articolo trovato per questo topic.
          </p>
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
