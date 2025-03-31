import Image from "next/image";
import React from "react";

import CollectionsMovingCards from "@/components/collections/CollectionsMovingCards";
import FeaturedPostSlider from "@/components/featured-post/FeaturedPostSlider";
import InfiniteMovingCardsWithImage from "@/components/ui/infinite-moving-cards-with-image";

import PercosiDesk from "./PercorsiDesk";
import PercorsiMobile from "./PercorsiMobile";

const fetchPosts = async () => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/articles`);

    if (!response.ok) throw new Error("Errore nel recupero dei dati");

    return await response.json();
  } catch (error) {
    console.error("Errore nel fetch:", error);
    return [];
  }
};

const page = async () => {
  const posts = await fetchPosts();
  console.log("post:", posts);

  if (!posts) {
    return (
      <div>
        <h1>Errore nel recupero dei dati</h1>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mx-12 relative w-screen bg-background ">
        <div className="xl:flex w-full items-end">
          <FeaturedPostSlider posts={posts} isNew />
        </div>
      </div>
      <h1 className="max-sm:text-[2.5rem] max-md:text-[3rem] md:text-6xl lg:text-7xl xl:text-7xl max-md:mt-8 mt-12 font-title text-gradient font-bold">
        Top Picks
      </h1>
      <div className="mt-8 max-md:mt-4">
        <InfiniteMovingCardsWithImage posts={posts} speed={"slow"} />
      </div>
      <h1 className="max-sm:text-[2.5rem] max-md:text-[3rem] md:text-6xl lg:text-7xl xl:text-7xl max-md:mt-8 mt-12 font-title text-gradient font-bold px-10 text-center sm:px-4">
        I nostri Percorsi
      </h1>
      <div className="mt-8 max-md:mt-4">
        <div className="lg:hidden">
          <PercorsiMobile />
        </div>
        <div className="hidden lg:block">
          <PercosiDesk />
        </div>
      </div>
    </div>
  );
};

export default page;
