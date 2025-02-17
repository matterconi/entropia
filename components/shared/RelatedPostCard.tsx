"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

import Tag from "@/components/shared/Tag";

import { ShinyButton } from "../ui/shiny-button";

import { Post } from "@/types"

interface RelatedPostProps {
  post: Post;
  isHot?: boolean;
}

const RelatedPostCard: React.FC<RelatedPostProps> = ({ post, isHot }) => {
  const { title, author = {
    _id: "#",
    username: "",
  }, coverImage, categories, genres, topics } = post;

  const tags = [
    ...categories?.map((category) => ({
      label: category.name,
      type: "categorie",
    })),
    ...genres?.map((genre) => ({ label: genre.name, type: "generi" })),
    ...topics?.map((topic) => ({ label: topic.name, type: "topic" })),
  ];

  return (
    <div className="w-full h-full relative">
      {/* Title */}
      <div className="bg-background relative h-full w-full flex flex-col items-center justify-between pt-8 px-4 rounded-lg min-h-[350px]">
        <div className="bg-background w-full h-fit flex flex-col items-center justify-center z-40 rounded-lg p-2">
          {isHot && <Tag tag={{ label: "Hot", type: "hot" }} />}
          <h3 className="my-2 text-lg font-title text-center line-clamp-2 w-fit text-gradient animated-gradient">
            {title}
          </h3>
        </div>
        <div className="z-30 flex flex-col w-full pb-8">
          <div className="flex w-full items-end justify-between">
            <div className="flex flex-row-reverse flex-wrap gap-1 items-start justify-end">
              {tags.map((tag, i) => (
                <Tag key={i} tag={tag} />
              ))}
            </div>
            <div className="min-w-fit p-2 space-x-2 rounded-lg bg-background flex items-center justify-center">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full overflow-hidden relative">
                <img
                  src={`https://api.dicebear.com/5.x/adventurer/svg?seed=${author.username}`}
                  alt={`${author.username}'s avatar`}
                  className="object-cover w-full h-full"
                />
              </div>
              {/* Author Name */}
              <p className="text-xs">{author.username}</p>
            </div>
          </div>
          <div className="flex justify-center w-full mt-6">
            <Link
              href={`/categorie/${categories[0]?.name.toLowerCase()}/${title.toLowerCase()}?id=${post._id}`}
            >
              <div className="w-fit h-fit border-gradient animated-gradient p-[1px] rounded-lg">
                <div className="w-fit h-fit bg-background rounded-lg">
                  <ShinyButton className="font-sans font-semibold py-2 px-6">
                    <p className="text-gradient">Leggimi</p>
                  </ShinyButton>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
      {/* Image */}
      <Image
        src={coverImage}
        alt={title}
        fill
        className="rounded-lg object-cover z-10"
      />
    </div>
  );
};

export default RelatedPostCard;
