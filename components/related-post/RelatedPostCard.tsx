"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

import Tag from "@/components/tag/Tag";
import { Post } from "@/types";

import TagManager from "../tag/TagManager";
import { ShinyButton } from "../ui/shiny-button";

interface RelatedPostProps {
  post: Post;
  isHot?: boolean;
}

const RelatedPostCard: React.FC<RelatedPostProps> = ({ post, isHot }) => {
  const {
    title,
    author = { _id: "#", username: "", profileimg: "/default-profile.png" },
    coverImage,
    categories,
    genres,
    topics,
    aiDescription,
    series, // Usando i dati della serie
    isSeriesChapter,
  } = post;

  const emailSeed = author.username;
  const avatarUrl = `https://api.dicebear.com/5.x/adventurer/svg?seed=${emailSeed}`;

  const tags = [
    ...categories?.map((category, index) => ({
      label: category.name,
      type: "categorie",
      relevance: category.relevance !== undefined ? category.relevance : index, // Usa relevance se disponibile, altrimenti usa l'indice
    })),
    ...genres?.map((genre, index) => ({
      label: genre.name,
      type: "generi",
      relevance: genre.relevance !== undefined ? genre.relevance : index,
    })),
    ...topics?.map((topic, index) => ({
      label: topic.name,
      type: "topic",
      relevance: topic.relevance !== undefined ? topic.relevance : index,
    })),
  ];

  return (
    <div className="w-full h-full flex flex-col rounded-lg overflow-hidden bg-background shadow-md">
      {/* Image at the top with author tag inside */}
      <div className="relative w-full h-48">
        <Image src={coverImage} alt={title} fill className="object-cover" />

        {/* Serie/Collection banner (top left) with gradient */}
        {isSeriesChapter && (
          <div className="absolute top-0 left-0 z-20 bg-background rounded-br-md ">
            <div className="font-semibold text-gradient py-1 px-4 shadow-md">
              <Link
                href={`/raccolte/${series?.title}`}
                className="hover:underline text-sm font-semibold"
              >
                {series?.title}
              </Link>
            </div>
          </div>
        )}

        {/* Hot tag (moved to top right) */}
        {isHot && (
          <div className="absolute top-2 right-2 z-10">
            <Tag tag={{ label: "Hot", type: "hot" }} />
          </div>
        )}

        {/* Author info (bottom right of the image) */}
        <div className="absolute bottom-2 right-2 z-10">
          <div className="rounded-lg p-2 bg-background flex items-center w-fit backdrop-blur-sm shadow-sm">
            <div className="w-6 h-6 rounded-full overflow-hidden relative">
              <img
                src={
                  author.profileimg !== "/default-profile.png"
                    ? author.profileimg
                    : avatarUrl
                }
                alt={`${author.username}'s avatar`}
                className="object-cover w-full h-full"
              />
            </div>
            <p className="text-xs ml-2 font-medium font-title">
              {author.username}
            </p>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex flex-col p-4 flex-grow">
        {/* Title */}
        <h3 className="text-lg font-title line-clamp-2 text-gradient animated-gradient mb-2 font-bold">
          {title}
        </h3>

        {/* Description */}
        <h4 className="text-sm mb-4 line-clamp-4">{aiDescription}</h4>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          <TagManager tags={tags} isRelated />
        </div>

        {/* Read button */}
        <div className="flex justify-center w-full mt-auto">
          <Link
            href={{
              pathname: `/articoli/${title.toLowerCase().replace(/\s+/g, "-")}`,
              query: { id: post._id },
            }}
          >
            <div className="w-fit h-fit border-gradient animated-gradient p-[1px] rounded-lg">
              <div className="w-fit h-fit bg-background rounded-lg">
                <ShinyButton className="font-sans font-semibold py-2 px-6">
                  <p className="text-gradient">Leggi</p>
                </ShinyButton>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RelatedPostCard;
