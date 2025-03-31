"use client";

import React, { useEffect, useState } from "react";

import RelatedPostCard from "@/components/related-post/RelatedPostCard";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { CategoryKeys, GenreKeys, Post, TopicKeys } from "@/types";

// Componente per la griglia di articoli con caricamento incrementale
const ArticlesGrid = ({
  initialPosts,
  type?,
  baseUrl,
  queryString,
}: {
  initialPosts: Post[];
  type: CategoryKeys | GenreKeys | TopicKeys;
  baseUrl: string;
  queryString: string;
}) => {
  const POSTS_PER_PAGE = 8;

  // Stato per tracciare tutti gli articoli caricati
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  // Stato per tracciare quanti articoli mostrare
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);

  // Traccia se ci sono più articoli da caricare
  const [hasMore, setHasMore] = useState(initialPosts.length >= POSTS_PER_PAGE);

  // Stato per indicare il caricamento
  const [isLoading, setIsLoading] = useState(false);

  // Aggiorna i post quando cambiano i filtri (initialPosts)
  useEffect(() => {
    setPosts(initialPosts);
    setVisibleCount(POSTS_PER_PAGE);
    setHasMore(initialPosts.length >= POSTS_PER_PAGE);
  }, [initialPosts]);

  const loadMorePosts = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    try {
      // Calcola l'offset per la prossima pagina
      const offset = posts.length;

      // Costruisci l'URL con i parametri di paginazione
      const paginationParams = new URLSearchParams(queryString);
      paginationParams.set("offset", offset.toString());
      paginationParams.set("limit", POSTS_PER_PAGE.toString());

      const nextPageUrl = `${baseUrl}?${paginationParams.toString()}`;

      const response = await fetch(nextPageUrl);

      if (!response.ok) {
        throw new Error("Errore nel caricamento di altri articoli");
      }

      const data = await response.json();
      const newPosts = data.articles;

      // Aggiorna lo stato con i nuovi post
      setPosts((prevPosts) => [...prevPosts, ...newPosts]);

      // Incrementa il numero di post visibili
      setVisibleCount((prevCount) => prevCount + POSTS_PER_PAGE);

      // Verifica se ci sono altri post da caricare
      setHasMore(newPosts.length === POSTS_PER_PAGE);
    } catch (error) {
      console.error("Errore nel caricamento di altri articoli:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mostra solo il numero di post specificato da visibleCount
  const visiblePosts = posts.slice(0, visibleCount);

  // Verifica se ci sono altri post da mostrare tra quelli già caricati
  const hasMoreVisible = visibleCount < posts.length;

  // Funzione per mostrare più post tra quelli già caricati
  const showMorePosts = () => {
    if (visibleCount < posts.length) {
      setVisibleCount((prevCount) =>
        Math.min(prevCount + POSTS_PER_PAGE, posts.length),
      );
    } else if (hasMore) {
      loadMorePosts();
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 w-full md:px-10">
        {visiblePosts.map((post: Post, i: number) => (
          <RelatedPostCard key={post._id || i} post={post} />
        ))}
      </div>

      {(hasMoreVisible || hasMore) && (
        <div className="w-full flex items-center justify-center my-12 px-12">
          <RainbowButton
            className="w-full max-w-md"
            onClick={showMorePosts}
            disabled={isLoading}
          >
            <p>{isLoading ? "Caricamento..." : `Carica altri ${type}`}</p>
          </RainbowButton>
        </div>
      )}
    </>
  );
};

export default ArticlesGrid;
