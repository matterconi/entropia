"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import React, { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { RainbowInput } from "@/components/ui/rainbow-input";

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
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  const [searchQuery, setSearchQuery] = useState(query);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Aggiorna lo stato della ricerca quando l'input cambia
  useEffect(() => {
    setIsSearching(searchQuery.length > 0);
  }, [searchQuery]);

  // Chiusura automatica quando si clicca fuori dal componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearching(false);
        setSearchQuery(""); // Resetta la query quando chiude
      }
    };

    if (isSearching) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSearching]);

  return (
    <div className="relative w-full max-w-3xl">
      {/* Overlay Blur (solo se isSearching è attivo) */}
      {isSearching && (
        <div className="fixed inset-0 bg-gray-300 bg-opacity-40 backdrop-blur-md z-40"></div>
      )}

      <div ref={searchRef}>
        {/* Input Ricerca */}
        <div className="relative z-40 border-gradient animated-gradient p-[1px] rounded-md">
          <RainbowInput className="w-full flex h-[54px] grow flex-1 items-center gap-4 rounded-md px-4 bg-white hover:!bg-white focus:!bg-white">
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
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`h-fit no-focus w-full rounded-md border-none shadow-none outline-none focus:outline-none focus-visible:outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 ${otherClasses}`}
            />
          </RainbowInput>
        </div>

        {/* Dropdown Risultati */}
        {isSearching && (
          <div className="absolute w-full mt-2 bg-background rounded-md shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 transform translate-y-2 z-50 min-h-[350px]">
            <div className="p-4">
              <p className="text-gray-500">
                🔍 Sto cercando "{searchQuery}"...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocalSearch;
