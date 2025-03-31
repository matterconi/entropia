// components/post-page/RecommendedArticles.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

import RelatedPostCard from "../related-post/RelatedPostCard";

// Definizione del tipo per gli articoli raccomandati
interface RecommendedArticle {
  _id: string;
  title: string;
  coverImage: string;
  author: {
    username: string;
    _id: string;
    profileimg?: string; // Rinominato da profileImg a profileimg
    bio?: string;
  };
  publicationDate: string;
  categories: { _id: string; name: string }[];
  genres: { id: { _id: string; name: string }; relevance: number }[];
  topics: { id: { _id: string; name: string }; relevance: number }[];
  isSeriesChapter?: boolean;
  series?: {
    _id: string;
    title: string;
    totalChapters?: number;
    chapters?: string[];
  };
  aiDescription?: string;
  similarity?: number;
}

// Componente principale per gli articoli raccomandati
const RecommendedArticles: React.FC<{ articleId: string }> = ({
  articleId,
}) => {
  const [recommendedArticles, setRecommendedArticles] = useState<
    RecommendedArticle[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Effettua la chiamata API per ottenere gli articoli raccomandati
  useEffect(() => {
    async function fetchRecommendedArticles() {
      if (!articleId) return;

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/recommendations?articleId=${articleId}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch recommendations");
        }

        const data = await response.json();

        // Trasforma i dati per rinominare profileImg in profileimg
        const transformedArticles = data.articles.map((article: any) => {
          if (article.author && article.author.profileImg) {
            return {
              ...article,
              author: {
                ...article.author,
                profileimg: article.author.profileImg,
                profileImg: undefined, // Rimuove la vecchia proprietà
              },
            };
          }
          return article;
        });

        setRecommendedArticles(transformedArticles || []);
      } catch (error) {
        console.error("Error fetching recommended articles:", error);
      } finally {
        setIsLoading(false);
        setInitialLoad(false);
      }
    }

    fetchRecommendedArticles();
  }, [articleId]);

  // Se non ci sono articoli raccomandati, non mostrare nulla
  if (!initialLoad && recommendedArticles.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-12">
      <h2 className="text-2xl font-semibold mb-6">Articoli consigliati</h2>

      {isLoading && initialLoad ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-8 w-full">
          {recommendedArticles.map((article) => (
            <RelatedPostCard key={article._id} post={article} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendedArticles;
