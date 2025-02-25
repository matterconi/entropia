import Image from "next/image";
import React from "react";

import FeaturedPostSlider from "@/components/shared/FeaturedPostSlider";
import InfiniteMovingCardsWithImage from "@/components/ui/infinite-moving-cards-with-image";

const fetchPosts = async () => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/articles`, {
      next: { revalidate: 600000 }, // ISR: rigenera i dati ogni 10 minuti
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
        <h1 className="mt-4 md:mt-8 mb-4 md:mb-12 lg:mb-8 w-full font-title max-sm:text-[2.5rem] max-md:text-[3rem] md:text-6xl lg:text-7xl xl:text-7xl text-center flex justify-center items-center font-bold gap-4 max-lg:flex-col-reverse lg:mt-8">
          <span className="max-md:hidden text-gradient animated-gradient">
            Novità da Versia
          </span>
          <span className="md:hidden text-gradient animated-gradient">
            Novità
          </span>
        </h1>

        <div className="xl:flex w-full items-end">
          <FeaturedPostSlider posts={posts} isNew />
        </div>
      </div>
      <h1 className="max-sm:text-[2.5rem] max-md:text-[3rem] md:text-6xl lg:text-7xl xl:text-7xl max-md:mt-8 mt-12 font-title text-gradient font-bold">
        Top Picks
      </h1>
      <div className="mt-8 max-md:mt-4">
        <InfiniteMovingCardsWithImage posts={posts} />
      </div>
      <div className="w-full  px-12 max-md:px-6 mt-8"></div>
    </div>
  );
};

export default page;
