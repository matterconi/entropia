"use client";

import { BookOpen, Calendar, Hash, Layers } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import Tag from "../tag/Tag";
import { ShinyButton } from "../ui/shiny-button";

interface Collection {
  _id: string;
  title: string;
  coverImage: string;
  description: string;
  articleCount: number;
  category?: { name: string };
  genre?: { name: string };
  lastUpdated?: string;
  featured?: boolean;
}

interface CollectionCardProps {
  collection: Collection;
  isFeatured?: boolean;
}

const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  isFeatured = false,
}) => {
  const {
    _id,
    title,
    coverImage,
    description,
    articleCount,
    category,
    genre,
    lastUpdated,
    featured,
  } = collection;

  return (
    <div className="w-full h-full flex flex-col rounded-lg overflow-hidden bg-background shadow-md">
      {/* Image at the top */}
      <div className="relative w-full h-48">
        <Image src={coverImage} alt={title} fill className="object-cover" />

        {/* Article count badge */}
        <div className="absolute top-2 right-2 z-10 bg-primary/90 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
          <BookOpen size={14} />
          <span>{articleCount} articoli</span>
        </div>

        {/* Featured badge */}
        {(isFeatured || featured) && (
          <div className="absolute top-2 left-2 z-10">
            <Tag tag={{ label: "In evidenza", type: "hot" }} />
          </div>
        )}

        {/* Last updated (if available) */}
        {lastUpdated && (
          <div className="absolute bottom-2 left-2 z-10 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-xs flex items-center gap-1">
            <Calendar size={12} />
            <span>
              Agg: {new Date(lastUpdated).toLocaleDateString("it-IT")}
            </span>
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="flex flex-col p-4 flex-grow">
        {/* Title */}
        <h3 className="text-lg font-title line-clamp-2 text-gradient animated-gradient mb-2 font-bold">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm mb-4 line-clamp-3">{description}</p>

        {/* Category and Genre */}
        <div className="flex flex-wrap gap-2 mb-4">
          {category && (
            <div className="bg-secondary/20 text-secondary px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
              <Hash size={12} />
              {category.name}
            </div>
          )}

          {genre && (
            <div className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
              <Layers size={12} />
              {genre.name}
            </div>
          )}
        </div>

        {/* Explore button */}
        <div className="flex justify-center w-full mt-auto">
          <Link
            href={`/collezioni/${title.toLowerCase().replace(/\s+/g, "-")}?id=${_id}`}
          >
            <div className="w-fit h-fit border-gradient animated-gradient p-[1px] rounded-lg">
              <div className="w-fit h-fit bg-background rounded-lg">
                <ShinyButton className="font-sans font-semibold py-2 px-6">
                  <p className="text-gradient">Esplora</p>
                </ShinyButton>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CollectionCard;
