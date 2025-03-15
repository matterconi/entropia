"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface FilterContextType {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  updateFilters: (newFilters: Filters) => void;
  updatePartialFilter: (id: string, value: string | string[]) => void;
  clearFilters: () => void;
  updateSearchQuery: (query: string) => void;
}

interface Filters {
  [key: string]: string | string[];
  authors: string[];
  categories: string[];
  genres: string[];
  topics: string[];
  sort: string;
  query: string;
}

// Definiamo quali parametri sono filtri
const filterKeys = [
  "authors",
  "categories",
  "genres",
  "topics",
  "sort",
  "query",
];

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);
  const isInitialMount = useRef(true);
  const isUpdatingFromURL = useRef(false);
  const isUpdatingFilters = useRef(false);
  const filtersRef = useRef<Filters>({
    authors: [],
    categories: [],
    genres: [],
    topics: [],
    sort: "",
    query: "",
  });

  // Stato locale dei filtri
  const [filters, setFilters] = useState<Filters>({
    authors: [],
    categories: [],
    genres: [],
    topics: [],
    sort: "",
    query: "",
  });

  // Aggiorna il ref quando i filtri cambiano
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const updateFilters = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  // Sincronizza i filtri con i parametri URL all'inizializzazione
  useEffect(() => {
    if (isInitialMount.current) {
      const params = new URLSearchParams(searchParams.toString());
      const initialFilters: Filters = {
        authors: params.get("authors")?.split(",").filter(Boolean) || [],
        categories: params.get("categories")?.split(",").filter(Boolean) || [],
        genres: params.get("genres")?.split(",").filter(Boolean) || [],
        topics: params.get("topics")?.split(",").filter(Boolean) || [],
        sort: params.get("sort") || "",
        query: params.get("query") || "",
      };

      setFilters(initialFilters);
      isInitialMount.current = false;
    }
  }, [searchParams]);

  // Sincronizzazione dell'URL quando i filtri cambiano
  useEffect(() => {
    // Ignora i cambiamenti durante l'inizializzazione o quando si aggiorna da URL
    if (isInitialMount.current || isUpdatingFromURL.current) {
      isUpdatingFromURL.current = false;
      return;
    }

    // Salta se il pathname è cambiato
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      return;
    }

    const currentParams = new URLSearchParams(searchParams.toString());
    const newParams = new URLSearchParams();

    // Aggiungi i nuovi filtri
    filterKeys.forEach((key) => {
      const value = filters[key];
      if (Array.isArray(value) && value.length > 0) {
        newParams.set(key, value.join(","));
      } else if (typeof value === "string" && value) {
        newParams.set(key, value);
      }
    });

    // Preserva altri parametri URL non-filtro
    for (const [key, value] of currentParams.entries()) {
      if (!filterKeys.includes(key)) {
        newParams.set(key, value);
      }
    }

    // Verifica se ci sono cambiamenti reali
    let hasFiltersChanged = false;
    for (const key of filterKeys) {
      const currentValue = currentParams.get(key) || "";
      const newValue = newParams.get(key) || "";
      if (currentValue !== newValue) {
        hasFiltersChanged = true;
        break;
      }
    }

    if (hasFiltersChanged) {
      isUpdatingFilters.current = true;
      router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
    }
  }, [filters, pathname, router, searchParams]);

  // Funzione memoizzata per controllare le differenze tra filtri
  const areFiltersDifferent = useCallback((newFilters: Filters) => {
    return filterKeys.some((key) => {
      const typedKey = key as keyof Filters;
      const current = filtersRef.current[typedKey];
      const newValue = newFilters[typedKey];

      if (Array.isArray(current) && Array.isArray(newValue)) {
        if (current.length !== newValue.length) return true;
        return current.some((item, index) => item !== newValue[index]);
      }

      return current !== newValue;
    });
  }, []);

  // Sincronizzazione quando l'URL cambia
  useEffect(() => {
    // Ignora se stiamo noi stessi aggiornando l'URL o se è il primo mount
    if (isUpdatingFilters.current || isInitialMount.current) {
      isUpdatingFilters.current = false;
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    const newFilters: Filters = {
      authors: params.get("authors")?.split(",").filter(Boolean) || [],
      categories: params.get("categories")?.split(",").filter(Boolean) || [],
      genres: params.get("genres")?.split(",").filter(Boolean) || [],
      topics: params.get("topics")?.split(",").filter(Boolean) || [],
      sort: params.get("sort") || "",
      query: params.get("query") || "",
    };

    // Usa la funzione memoizzata per controllare le differenze
    if (areFiltersDifferent(newFilters)) {
      isUpdatingFromURL.current = true;
      setFilters(newFilters);
    }
  }, [searchParams, areFiltersDifferent]);

  const updatePartialFilter = (key: string, value: string | string[]) => {
    setFilters((prevFilters) => {
      const newValue = value ?? (Array.isArray(prevFilters[key]) ? [] : "");
      return {
        ...prevFilters,
        [key]: newValue,
      };
    });
  };

  // Funzione specifica per aggiornare la query di ricerca
  const updateSearchQuery = (query: string) => {
    updatePartialFilter("query", query);
  };

  const clearFilters = () => {
    setFilters({
      authors: [],
      categories: [],
      genres: [],
      topics: [],
      sort: "",
      query: "",
    });

    const currentParams = new URLSearchParams(searchParams.toString());
    filterKeys.forEach((key) => currentParams.delete(key));

    router.replace(`${pathname}?${currentParams.toString()}`, {
      scroll: false,
    });
  };

  return (
    <FilterContext.Provider
      value={{
        filters,
        setFilters,
        updateFilters,
        updatePartialFilter,
        clearFilters,
        updateSearchQuery,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

// Hook per usare il contesto
export const useFilterContext = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilterContext must be used within a FilterProvider");
  }
  return context;
};
