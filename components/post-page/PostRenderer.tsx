import Image from "next/image";
import Link from "next/link";
import React from "react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

import CommentSection from "@/components/post-page/CommentSection";
import MiniCTA from "@/components/post-page/MiniCTA";
import MiniFooter from "@/components/post-page/MiniFooter";
import PaginationMenu from "@/components/post-page/PaginationMenu";
import Tag from "@/components/tag/Tag";

import { ShinyButton } from "../ui/shiny-button";

interface IArticle {
  title: string;
  chapterTitle?: string;
  chapterIndex?: number;
  markdownPath: string; // ✅ Contenuto Markdown scaricato da Supabase
  coverImage: string;
  author: { username: string; _id: string };
  genres: { _id: string; name: string }[];
  categories: { _id: string; name: string }[];
  topics: { _id: string; name: string }[];
  publicationDate: string;
  likeCount: number;
}

interface IPost {
  message: string;
  article: IArticle;
  markdownContent: string;
}

const PostRenderer: React.FC<{ post: IPost; id: string }> = ({ post, id }) => {
  const {
    title,
    chapterTitle,
    chapterIndex,
    author,
    coverImage,
    markdownPath,
    publicationDate,
    genres,
    categories,
    topics,
    likeCount,
  } = post.article;
  return (
    <div className="p-4 px-12 max-sm:px-8 font-sans max-w-5xl w-full flex flex-col items-center justify-center mx-auto ">
      <div className="w-full h-full relative ">
        {/* Title */}
        <div className="bg-background relative h-full w-full flex flex-col items-center justify-center py-36">
          <div className="bg-background w-fit h-fit flex justify-center items-center z-40 rounded-lg mx-4">
            <h1 className="flex w-fit h-fit z-10 font-title text-4xl text-center p-4 md:py-8 rounded-lg text-gradient animated-gradient px-8 md:px-12">
              {title}
            </h1>
          </div>
        </div>

        {/* Cover Image */}
        <Image
          src={coverImage}
          alt={title}
          fill
          className="rounded-lg object-cover z-10"
        />
      </div>

      {/* Markdown Content */}
      <div className="w-full mt-8">
        {chapterTitle && (
          <h1 className="text-2xl font-semibold text-title mb-4">
            {`${chapterIndex}. ${chapterTitle}`}
          </h1>
        )}

        <div className="prose max-w-5xl text-foreground">
          <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {post.markdownContent}
          </Markdown>
        </div>
      </div>

      {/* Metadata & Tags */}
      <div className="flex max-md:flex-col-reverse max-md:justify-center items-center justify-between w-full max-md:items-start max-md:gap-4 h-full mt-4">
        <PaginationMenu />
        <p className="max-md:self-end">
          {new Date(publicationDate).toLocaleDateString()}
        </p>
      </div>
      <div className="flex max-md:flex-col max-md:items-start max-md:space-y-6 justify-between items-center w-full mt-6 h-full">
        <div className="max-md:mt-6 flex md:flex-col items-start justify-between w-full h-full gap-4">
          <MiniCTA id={id} likeCount={likeCount} />
          <div className="flex flex-wrap gap-1 items-end justify-end">
            {[
              ...genres.map((tag) => ({ ...tag, type: "generi" })),
              ...categories.map((tag) => ({ ...tag, type: "categorie" })),
              ...topics.map((tag) => ({ ...tag, type: "topic" })),
            ].map((tag, i) => (
              <Tag key={i} tag={{ label: tag.name, type: tag.type }} />
            ))}
          </div>
        </div>
        <div className="flex md:flex-col justify-start items-center md:items-end gap-4 w-full">
          <Image
            src={coverImage}
            alt={title}
            width={75}
            height={75}
            className="object-cover rounded-lg"
          />
          <Link href={`/nft/${title.toLowerCase()}`}>
            <div className="w-fit h-full p-[1px] border-gradient animated-gradient rounded-lg">
              <div className="bg-background w-fit h-full rounded-lg">
                <ShinyButton className="font-title text-gradient">
                  <p className="text-gradient text-sm">NFT Ufficiale</p>
                </ShinyButton>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Comment Section */}
      <div className="self-start w-full">
        <CommentSection id={id} />
      </div>
      <div className="w-full h-[1px] bg-black mt-8"></div>
      <MiniFooter title={title} author={author.username} authorBio="" />
    </div>
  );
};

export default PostRenderer;
