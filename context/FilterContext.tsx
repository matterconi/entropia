"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// Creazione del contesto
const FilterContext = createContext();

interface Filters {
  authors: string[];
  categories: string[];
  genres: string[];
  sort: string;
}

// Definiamo quali parametri sono filtri
const filterKeys = ["authors", "categories", "genres", "topic", "sort"];

export const FilterProvider = ({ children }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);

  // Stato locale dei filtri
  const [filters, setFilters] = useState<Filters>({
    authors: [],
    categories: [],
    genres: [],
    sort: "",
  });

  // Effetto per sincronizzare i filtri con l'URL all'inizio
  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    setFilters({
      authors: params.get("authors")?.split(",") || [],
      categories: params.get("categories")?.split(",") || [],
      genres: params.get("genres")?.split(",") || [],
      sort: params.get("sort") || "",
    });
  }, [searchParams]);

  useEffect(() => {
    // Controllo se il pathname è cambiato
    if (prevPathnameRef.current !== pathname) {
      // Aggiorna il ref a pathname attuale e non fare altro
      prevPathnameRef.current = pathname;
      return;
    }

    // Logica per aggiornare l'URL solo se i filtri cambiano e siamo sullo stesso pathname
    const currentParams = new URLSearchParams(searchParams);
    const newParams = new URLSearchParams();

    console.log("🔍 Params attuali:", currentParams.toString());

    // Manteniamo solo i filtri effettivamente presenti
    filterKeys.forEach((key) => {
      const value = filters[key as keyof Filters];
      if (Array.isArray(value) && value.length > 0) {
        newParams.set(key, value.join(","));
      } else if (typeof value === "string" && value) {
        newParams.set(key, value);
      }
    });

    // Manteniamo anche gli altri parametri già presenti se non sono filtri
    for (const [key, value] of currentParams.entries()) {
      if (!filterKeys.includes(key)) {
        newParams.set(key, value);
      }
    }

    // Confrontiamo solo i filtri per evitare refresh inutili
    const hasFiltersChanged = filterKeys.some(
      (key) => currentParams.get(key) !== newParams.get(key),
    );

    console.log("🆕 Nuovi params:", newParams.toString());

    // Se i filtri sono cambiati, aggiorniamo l'URL
    if (hasFiltersChanged) {
      router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
    }
  }, [filters, pathname, router, searchParams]); // dipendenze del useEffect

  // Funzione per aggiornare tutti i filtri in un'unica chiamata
  const updateFilter = (updatedFilters: Partial<Filters>) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...updatedFilters,
    }));
  };

  // Funzione per aggiornare un filtro specifico
  const updatePartialFilter = (
    key: keyof Filters,
    value: string[] | string,
  ) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  // Funzione per azzerare solo i filtri, mantenendo altri parametri (es. `id`)
  const clearFilters = () => {
    setFilters({
      authors: [],
      categories: [],
      genres: [],
      sort: "",
    });

    // ✅ Manteniamo gli altri parametri e rimuoviamo solo i filtri
    const currentParams = new URLSearchParams(searchParams);
    filterKeys.forEach((key) => currentParams.delete(key));

    router.replace(`${pathname}?${currentParams.toString()}`, {
      scroll: false,
    });
  };

  return (
    <FilterContext.Provider
      value={{
        filters,
        updateFilter,
        updatePartialFilter,
        clearFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

// Hook per utilizzare il contesto
export const useFilterContext = () => useContext(FilterContext);
