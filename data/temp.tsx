import Image from "next/image";
import React from "react";

import FeaturedPost from "@/components/shared/FeaturedPostSlider";
import RelatedPostCard from "@/components/shared/RelatedPostCard";
import SectionHeader from "@/components/shared/SectionHeader";
import SortPosts from "@/components/shared/SortPost";
import Tag from "@/components/shared/Tag";
import InfiniteMovingCardsGenres from "@/components/ui/infinite-moving-cards-genres";
import InfiniteMovingCardsWithImage from "@/components/ui/infinite-moving-cards-with-image";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { genres as generi } from "@/data/data";
import hoDimenticatoIlColoreDeiTuoiOcchi from "@/data/post/ho-dimenticato-il-colore-dei-tuoi-occhi";
import laDonnaEIlPozzo from "@/data/post/la-donna-e-il-pozzo-1";

const categories: { [key: string]: number } = {
  racconti: 1,
  poesie: 2,
  saggi: 3,
  tutorial: 4,
  recensioni: 5,
  viaggi: 6,
  pensieri: 7,
};

const page = async ({ params }: { params: { categoria: string } }) => {
  const { categoria } = await params;
  if (!categoria || !(categoria in categories)) {
    return (
      <div>
        <h1>Categoria non trovata!</h1>
      </div>
    );
  }
  const section = categories[categoria as keyof typeof categories];
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mx-12 relative w-screen  bg-background ">
        <SectionHeader section={section - 1} />
        <div className="mt-8 flex max-md:flex-col max-md:items-start items-center justify-between w-full max-md:px-6 px-12"></div>
        <FeaturedPost
          posts={[hoDimenticatoIlColoreDeiTuoiOcchi, laDonnaEIlPozzo]}
          isNew
        />
      </div>
      <h1 className="text-5xl mt-8 font-title text-gradient font-bold">
        Top Picks
      </h1>
      <div className="mt-6">
        <InfiniteMovingCardsWithImage />
      </div>
      <h1 className="text-5xl mt-8 font-title text-gradient font-bold">
        Generi
      </h1>
      <div className="mt-6">
        <InfiniteMovingCardsGenres items={generi} direction="right" />
      </div>
      <div className="mt-8 flex max-md:flex-col max-md:items-start items-center justify-between w-full max-md:px-6 px-12">
        <h3 className="text-3xl font-semibold max-md:mb-4">
          Ordina gli articoli per
        </h3>
        <SortPosts />
      </div>
      <div className=" max-md:px-6 px-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 w-full mt-8">
        {[laDonnaEIlPozzo].map((post, i) => (
          <RelatedPostCard key={i} post={post} />
        ))}
      </div>
      <div className=" w-full flex items-center justify-center my-12 px-12">
        <RainbowButton className="w-full">
          <p>Leggi tutti i racconti</p>
        </RainbowButton>
      </div>
    </div>
  );
};

export default page;
