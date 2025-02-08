"use client";

import Image from "next/image";
import React from "react";

import Tag from "@/components/shared/Tag";

import { RainbowButton } from "../ui/rainbow-button";
import { ShinyButton } from "../ui/shiny-button";

interface TagProps {
  label: string;
  type: string;
}

interface RelatedPostProps {
  genre: string;
  tagExist: boolean;
}

const GenreImageCard = ({ genre, tagExist }: RelatedPostProps) => {
  const image =
    genre === "Romantico"
      ? "/assets/occhi.webp"
      : genre === "Azione"
        ? "/assets/lilla.jpeg"
        : genre === "Fantasy"
          ? "/assets/saggi.webp"
          : genre === "Storico"
            ? "/assets/tutorial.webp"
            : genre === "Avventura"
              ? "/assets/viaggi.webp"
              : genre === "Horror"
                ? "/assets/pensieri.webp"
                : "/assets/racconti.webp";
  return (
    <div className="w-full h-full relative min-w-[350px]">
      {/* Title */}
      <div className="bg-background relative h-full w-full flex flex-col items-center justify-between pt-8 px-4 rounded-lg min-h-[350px]">
        <div className="bg-background w-full h-fit flex flex-col items-center justify-center z-40 rounded-lg p-2">
          {tagExist && (
            <div className="h-8 w-full">
              <Tag tag={{ label: "hot", type: "hot" }} />
            </div>
          )}

          <h3 className="my-2 text-xl font-semibold text-center line-clamp-2 w-fit font-title text-gradient">
            {genre}
          </h3>
        </div>
        <div className="z-50 flex flex-col w-full pb-8">
          <div className="flex justify-center w-full mt-6">
            <div className="w-fit h-fit border-gradient animated-gradient p-[1px] rounded-lg">
              <div className="w-fit h-fit bg-background rounded-lg">
                <RainbowButton className="rounded-lg">Esplora</RainbowButton>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Image */}
      <Image
        src={image}
        alt="sea"
        fill
        className="rounded-lg object-cover z-10"
      />
    </div>
  );
};

export default GenreImageCard;
