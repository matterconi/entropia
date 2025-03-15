import Image from "next/image";
import Link from "next/link";
import React from "react";

import Tag from "@/components/tag/Tag";
import { Post } from "@/types";

import { ShinyButton } from "../ui/shiny-button";

interface FeaturedPostProps {
  post: Post;
  isNew?: boolean;
}

const FeaturedPost: React.FC<FeaturedPostProps> = ({ post, isNew }) => {
  const tags = [
    ...post.categories?.map((category) => ({
      label: category.name,
      type: "categorie",
    })),
    ...post.genres?.map((genre) => ({ label: genre.name, type: "generi" })),
    ...post.topics?.map((topic) => ({ label: topic.name, type: "topic" })),
  ];

  const { author = { _id: "#", username: "" } } = post;

  return (
    <div className="max-md:px-0">
      <div className="w-full max-md:min-h-[500px] md:min-h-[450px] relative flex flex-col">
        {/* Title */}

        <div className="relative w-full h-auto flex flex-col items-center justify-between  max-md:px-4 px-16 rounded-lg flex-1">
          <div className="flex items-start justify-center bg-white w-full z-40 rounded-lg mt-12">
            <h3 className="my-8 mx-3 w-full z-10 font-title max-md:text-2xl text-4xl text-center rounded-lg text-gradient animated-gradient max-md:line-clamp-2 line-clamp-3 p-2">
              <div className="mb-4 w-full flex items-center justify-center">
                {" "}
                <Tag
                  tag={
                    isNew
                      ? { label: "New!", type: "new" }
                      : { label: "Hot", type: "hot" }
                  }
                />
              </div>
              {post.title}
            </h3>
          </div>
          <div className="z-50 flex flex-col w-full pb-8">
            <div className="flex w-full items-end justify-between">
              <div className="flex flex-wrap gap-1 items-start justify-start">
                {tags.map((tag, i) => (
                  <Tag key={i} tag={tag} />
                ))}
              </div>
              <div className="min-w-fit p-2 space-x-2 rounded-lg bg-background flex items-center justify-center">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full overflow-hidden relative">
                  <img
                    src={`https://api.dicebear.com/5.x/adventurer/svg?seed=${"lololololo"}`}
                    alt={`${"swag"}'s avatar`}
                    className="object-cover w-full h-full"
                  />
                </div>
                {/* Author Name */}
                <p className="text-xs">{"gkflsbc"}</p>
              </div>
            </div>
            <div className="flex justify-center w-full mt-6">
              <div className="w-fit h-fit border-gradient animated-gradient p-[1px] rounded-lg">
                <div className="w-fit h-fit bg-background rounded-lg">
                  <Link
                    href={{
                      pathname: `/articoli/${post.title.toLowerCase()}`,
                      query: { id: post._id }, // 🔥 Mantiene i parametri della query
                    }}
                  >
                    <ShinyButton className="font-sans font-semibold p-2 px-8">
                      <p className="text-gradient text-lg">Leggimi</p>
                    </ShinyButton>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Image */}
        <Image
          src={post.coverImage}
          alt="sea"
          fill
          className="rounded-lg object-cover z-10"
        />
      </div>
    </div>
  );
};

export default FeaturedPost;
