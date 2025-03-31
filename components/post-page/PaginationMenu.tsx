"use client";

import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationMenuProps {
  serie: {
    _id: string;
    title: string;
    totalChapters: number;
    chapters: string[];
  };
  chapterIndex: number;
}

const PaginationMenu = ({ serie, chapterIndex }: PaginationMenuProps) => {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = React.useState(false);

  // Determina se ci sono capitoli precedenti o successivi
  const hasPrevChapter = chapterIndex > 1;
  const hasNextChapter = chapterIndex < serie.totalChapters;

  // Calcola gli ID dei capitoli precedente e successivo
  const prevChapterId = hasPrevChapter
    ? serie.chapters[chapterIndex - 2]
    : null;
  const nextChapterId = hasNextChapter ? serie.chapters[chapterIndex] : null;

  // Reset dello stato di navigazione quando cambia il chapterIndex
  useEffect(() => {
    setIsNavigating(false);
  }, [chapterIndex]);

  // Gestisce la navigazione senza refresh
  const navigateTo = (chapterId: string | null) => {
    if (!chapterId || isNavigating) return;

    setIsNavigating(true);
    router.push(`?id=${chapterId}`, { scroll: true });
  };

  return (
    <div className="h-full">
      <Pagination>
        <PaginationContent>
          {/* Pulsante Precedente */}
          <PaginationItem>
            <PaginationPrevious
              onClick={() => {
                if (hasPrevChapter) {
                  navigateTo(prevChapterId);
                }
              }}
              className={
                !hasPrevChapter || isNavigating
                  ? "opacity-50 pointer-events-none"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>

          {/* Indicatore di posizione */}
          <PaginationItem>
            <PaginationLink>
              {chapterIndex} di {serie.totalChapters}
            </PaginationLink>
          </PaginationItem>

          {/* Pulsante Successivo */}
          <PaginationItem>
            <PaginationNext
              onClick={() => {
                if (hasNextChapter) {
                  navigateTo(nextChapterId);
                }
              }}
              className={
                !hasNextChapter || isNavigating
                  ? "opacity-50 pointer-events-none"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default PaginationMenu;
