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
import RecommendedArticles from "@/components/post-page/RecommendedArticles";
import Tag from "@/components/tag/Tag";

import TagManager from "../tag/TagManager";
import { ShinyButton } from "../ui/shiny-button";

interface IArticle {
  title: string;
  chapterTitle?: string;
  chapterIndex?: number;
  markdownPath: string;
  coverImage: string;
  author: { username: string; _id: string; profileimg?: string; bio?: string };
  genres: { _id: string; name: string }[];
  categories: { _id: string; name: string }[];
  topics: { _id: string; name: string }[];
  publicationDate: string;
  likeCount: number;
  series: {
    _id: string;
    title: string;
    totalChapters: number;
    chapters: string[];
  };
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
      {post.article.series?._id ? (
        <div className="flex max-md:flex-col-reverse max-md:justify-center items-center justify-between w-full max-md:items-start max-md:gap-4 h-full mt-4">
          <PaginationMenu
            serie={post.article.series}
            chapterIndex={post.article.chapterIndex || 1}
          />
          <p className="max-md:self-end">
            {new Date(publicationDate).toLocaleDateString()}
          </p>
        </div>
      ) : (
        <div className="flex justify-end my-8 w-full">
          <p className="max-md:self-end">
            {new Date(publicationDate).toLocaleDateString()}
          </p>
        </div>
      )}
      <div className="flex max-md:flex-col max-md:items-start max-md:space-y-6 justify-between items-center w-full mt-6 h-full">
        <div className="max-md:mt-6 flex md:flex-col items-start justify-between w-full h-full gap-4">
          <MiniCTA id={id} likeCount={likeCount} />
          <div className="flex flex-wrap gap-1 items-end justify-end">
            <TagManager
              tags={[
                ...genres.map((tag) => ({ label: tag.name, type: "generi" })),
                ...categories.map((tag) => ({
                  label: tag.name,
                  type: "categorie",
                })),
                ...topics.map((tag) => ({ label: tag.name, type: "topic" })),
              ]}
              maxPerCategory={2}
            />
          </div>
        </div>
      </div>

      {/* Comment Section */}
      <div className="self-start w-full">
        <CommentSection id={id} />
      </div>

      <div className="w-full h-[1px] bg-black mt-8"></div>
      <MiniFooter title={title} author={author} nftImage={coverImage} />
      <div className="w-full h-[1px] bg-black mt-8"></div>
      {/* Recommended Articles Section */}
      <RecommendedArticles articleId={id} />
    </div>
  );
};

export default PostRenderer;
