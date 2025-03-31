"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

import Tag from "@/components/tag/Tag";
import TagManager from "@/components/tag/TagManager";
import { ShinyButton } from "@/components/ui/shiny-button";
import { analyzeImage } from "@/lib/cloudinary"; // Correggi il percorso di importazione
import { Post } from "@/types";

import GlowingBadge from "./GlowingBadge";

interface FeaturedPostProps {
  post: Post;
  isNew?: boolean;
}

const FeaturedPost: React.FC<FeaturedPostProps> = ({ post, isNew }) => {
  // Stato per memorizzare il colore dell'ombra del testo
  const [textShadow, setTextShadow] = useState<string>(
    "drop-shadow-[0_3px_6px_rgba(255,255,0,1)]",
  );
  // Stato opzionale per tenere traccia se l'immagine è scura o chiara
  const [isDark, setIsDark] = useState<boolean | null>(null);
  // Stato per tenere traccia dell'analisi in corso
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const tags = [
    ...post.categories?.map((category) => ({
      label: category.name,
      type: "categorie",
    })),
    ...post.genres?.map((genre) => ({ label: genre.name, type: "generi" })),
    ...post.topics?.map((topic) => ({ label: topic.name, type: "topic" })),
  ];

  const {
    author = { _id: "#", username: "", profileimg: "/default-profile.png" },
    isSeriesChapter,
    series,
  } = post;

  const emailSeed = author.username;
  const avatarUrl = `https://api.dicebear.com/5.x/adventurer/svg?seed=${emailSeed}`;

  // Effetto per analizzare l'immagine al caricamento del componente
  useEffect(() => {
    const analyzePostImage = async () => {
      if (post.coverImage) {
        setIsAnalyzing(true);
        try {
          // Ottieni informazioni complete sulla luminosità dell'immagine
          const analysisResult = await analyzeImage(post.coverImage);

          // Usa la logica invertita: ombra chiara per immagini chiare, ombra scura per immagini scure
          setTextShadow(analysisResult.defaultShadow);
          setIsDark(analysisResult.isDark);

          // Puoi anche usare i dati per altre personalizzazioni basate sulla luminosità
          console.log("Luminosità immagine:", analysisResult.brightness);
        } catch (error) {
          console.error("Errore nell'analisi dell'immagine:", error);
          // Mantieni l'ombra predefinita in caso di errore
        } finally {
          setIsAnalyzing(false);
        }
      }
    };

    analyzePostImage();
  }, [post.coverImage]);

  const gradientClass = isDark ? "text-white" : "text-black";

  return (
    <div className="max-md:px-0">
      <div className="w-full max-md:min-h-[500px] md:min-h-[450px] relative flex flex-col">
        {/* Cover Image */}
        <div className="absolute inset-0 w-full h-full z-10">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="rounded-lg object-cover"
            priority
          />
        </div>
        <div className="absolute top-0 left-0 flex justify-between items-center w-full">
          <div className="z-50 bg-background rounded-br-md">
            {/* Series banner */}
            {true && (
              <div className="font-semibold text-gradient font-title py-2 px-4 flex text-lg items-center justify-start gap-2 md:gap-4">
                <Link
                  href={`/raccolte/${series?.title}`}
                  className="hover:underline flex items-center justify-center gap-2 l"
                >
                  <span className="line-clamp-2">Vampiri su Instagram</span>
                </Link>
                <GlowingBadge />
              </div>
            )}
          </div>
          {/* Bookmark button */}
          <div className="z-50 px-4">
            <div className="w-fit bg-background/90 backdrop-blur-sm border border-foreground text-foreground hover:border-yellow-600 dark:hover:border-yellow-300 hover:text-yellow-600 dark:hover:text-yellow-300 p-2 rounded-full shadow-md transition-all duration-200 cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Main content container */}
        <div className="relative w-full h-auto flex flex-col items-start justify-end max-md:px-4 px-16 rounded-lg flex-1 z-30">
          <div className="flex flex-col items-center justify-end w-full mb-8 mt-auto">
            {/* Tag */}
            <div className="mb-1">
              <div className="w-full flex items-center justify-center">
                <Tag
                  tag={
                    isNew
                      ? { label: "New!", type: "new" }
                      : { label: "Hot", type: "hot" }
                  }
                />
              </div>
            </div>

            {/* Title con logica invertita per l'ombra */}

            <div className="flex items-center justify-center w-full">
              <h3
                className={`w-fit font-title max-md:text-4xl text-5xl ${gradientClass} ${textShadow} font-bold mb-4`}
              >
                <span className="inline-block px-[5px] max-md:line-clamp-3 md:line-clamp-2 leading-[1.25] bg-[your-background-color]">
                  {post.title}
                </span>
              </h3>
            </div>

            {/* Tags and author container */}
            <div className="flex flex-row w-full items-end justify-between gap-2 md:gap-4 mb-8">
              {/* Tags */}
              <div className="w-full md:w-2/3 rounded-lg">
                <div className="flex flex-wrap gap-2 items-start justify-start">
                  <TagManager tags={tags} />
                </div>
              </div>

              {/* Author */}
              <div className="w-fit flex items-center justify-center">
                <div className="bg-background backdrop-blur-sm rounded-lg p-2 space-x-2 shadow-sm flex items-center justify-center">
                  <div className="w-8 h-8 min-w-8 min-h-8 rounded-full overflow-hidden relative flex-shrink-0">
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
                  <p className="text-xs font-title">{author.username}</p>
                </div>
              </div>
            </div>

            {/* Centered Read button */}
            <div className="flex justify-center w-full">
              <div className="w-fit h-fit border-gradient animated-gradient p-[1px] rounded-lg">
                <div className="w-fit h-fit bg-background/80 backdrop-blur-sm rounded-lg">
                  <Link
                    href={{
                      pathname: `/articoli/${post.title.toLowerCase().replace(/\s+/g, "-")}`,
                      query: { id: post._id },
                    }}
                  >
                    <ShinyButton className="font-sans text-lg font-semibold p-2 px-8 w-full">
                      <p className="text-gradient">Leggi</p>
                    </ShinyButton>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedPost;
