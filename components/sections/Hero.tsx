import Image from "next/image";
import React from "react";

import FeaturedPostSlider from "@/components/shared/FeaturedPostSlider";
import RelatedPostCard from "@/components/shared/RelatedPostCard";
import SectionBanner from "@/components/shared/SectionBanner";
import SectionHeader from "@/components/shared/SectionHeader";
import SortPosts from "@/components/shared/SortPost";
import Tag from "@/components/shared/Tag";
import InfiniteMovingCardsWithImage from "@/components/ui/infinite-moving-cards-with-image";
import { RainbowButton } from "@/components/ui/rainbow-button";

const categories: { [key: string]: number } = {
  racconti: 1,
  poesie: 2,
  saggi: 3,
  tutorial: 4,
  recensioni: 5,
  viaggi: 6,
  pensieri: 7,
};

const fetchPosts = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/articles", {
      next: { revalidate: 600000 }, // ISR: rigenera i dati ogni 60 secondi
    });

    if (!response.ok) throw new Error("Errore nel recupero dei dati");

    return await response.json();
  } catch (error) {
    console.error("Errore nel fetch:", error);
    return [];
  }
};
const page = async () => {
  const posts = await fetchPosts();
  console.log(posts);
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mx-12 relative w-screen bg-background ">
        <h1 className="mt-8 mb-12 w-full font-title max-sm:text-[2.5rem] max-md:text-[3rem] md:text-6xl lg:text-7xl xl:text-7xl text-center flex justify-center items-center font-bold gap-4 max-lg:flex-col-reverse lg:mt-8">
          <span className="text-gradient animated-gradient">
            Novità da Versia
          </span>
        </h1>

        <div className="xl:flex w-full items-end">
          <FeaturedPostSlider posts={posts} isNew />
        </div>
      </div>
      <h1 className="text-5xl mt-8 font-title text-gradient font-bold">
        Top Picks
      </h1>
      <div className="mt-6">
        <InfiniteMovingCardsWithImage posts={posts} />
      </div>
      <div className="w-full  px-12 max-md:px-6 mt-8"></div>
    </div>
  );
};

export default page;
