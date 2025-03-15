"use client";

import _ from "lodash";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import React, { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { RainbowInput } from "@/components/ui/rainbow-input";
import { useFilterContext } from "@/context/FilterContext";

interface LocalSearchProps {
  route?: string;
  imgSrc?: string;
  placeholder: string;
  otherClasses?: string;
  isSearch?: boolean;
}

const LocalSearch = ({
  route,
  imgSrc,
  placeholder,
  otherClasses,
  isSearch,
}: LocalSearchProps) => {
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const { updateSearchQuery, filters } = useFilterContext();

  // Inizializza lo stato locale con il valore dal contesto o dai parametri URL
  const [searchQuery, setSearchQuery] = useState(
    filters.query || searchParams.get("query") || "",
  );

  // Riferimento per il valore precedente del filtro
  const prevFilterQueryRef = useRef(filters.query);

  // Funzione debounce per aggiornare la query nel contesto
  const debouncedUpdateQuery = useRef(
    _.debounce((value: string) => {
      console.log("🔍 Aggiorno query di ricerca:", value);
      updateSearchQuery(value);
    }, 500),
  ).current;

  // Gestisci il cambio del testo di ricerca
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedUpdateQuery(value);
  };

  // Sincronizza lo stato locale quando la query nel contesto cambia
  useEffect(() => {
    // Controlla se il filtro è cambiato e se è diverso dallo stato locale
    // Gestisce esplicitamente il caso del reset (quando filters.query è vuoto o undefined)
    if (
      prevFilterQueryRef.current !== filters.query ||
      (filters.query === "" && searchQuery !== "")
    ) {
      setSearchQuery((filters.query as string) || "");
    }

    // Aggiorna il riferimento per il prossimo ciclo
    prevFilterQueryRef.current = filters.query;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.query]);

  // Aggiungi un effetto di cleanup per il debounce
  useEffect(() => {
    return () => {
      debouncedUpdateQuery.cancel();
    };
  }, [debouncedUpdateQuery]);

  return (
    <div className="relative w-full max-w-3xl">
      <div className="relative z-10 border-gradient animated-gradient p-[1px] rounded-md">
        <RainbowInput className="w-full flex h-[54px] grow flex-1 items-center gap-4 rounded-md px-4 bg-background hover:!bg-background focus:!bg-background">
          {imgSrc && (
            <Image
              src={imgSrc}
              width={24}
              height={24}
              alt="Search"
              className="cursor-pointer"
            />
          )}
          <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleSearchChange}
            className={`h-fit no-focus w-full rounded-md border-none shadow-none outline-none focus:outline-none focus-visible:outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 ${otherClasses}`}
          />
        </RainbowInput>
      </div>
    </div>
  );
};

export default LocalSearch;
