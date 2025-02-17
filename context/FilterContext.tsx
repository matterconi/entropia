"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";

interface FilterContextType {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  updatePartialFilter: (id: string, value: string | string[]) => void;
  clearFilters: () => void;
}

// **Modifica 1**: Aggiunto l'indice dinamico `[key: string]` per supportare tutti i filtri
interface Filters {
  [key: string]: string | string[];
  authors: string[];
  categories: string[];
  genres: string[];
  sort: string;
}

// Definiamo quali parametri sono filtri
const filterKeys = ["authors", "categories", "genres", "topic", "sort"];

const FilterContext = createContext<FilterContextType | undefined>(undefined);

// **Modifica 2**: Tipizzazione corretta del provider
export const FilterProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
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

  // **Modifica 3**: Sincronizzazione dei filtri con l'URL
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
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      return;
    }

    const currentParams = new URLSearchParams(searchParams);
    const newParams = new URLSearchParams();

    filterKeys.forEach((key) => {
      const value = filters[key];
      if (Array.isArray(value) && value.length > 0) {
        newParams.set(key, value.join(","));
      } else if (typeof value === "string" && value) {
        newParams.set(key, value);
      }
    });

    for (const [key, value] of currentParams.entries()) {
      if (!filterKeys.includes(key)) {
        newParams.set(key, value);
      }
    }

    const hasFiltersChanged = filterKeys.some(
      (key) => currentParams.get(key) !== newParams.get(key)
    );

    if (hasFiltersChanged) {
      router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
    }
  }, [filters, pathname, router, searchParams]);

  // **Modifica 4**: Funzione per aggiornare un filtro specifico con stringa generica
  const updatePartialFilter = (key: string, value: string | string[]) => {
    setFilters((prevFilters) => {
      const newValue = value ?? (Array.isArray(prevFilters[key]) ? [] : "");
      return {
        ...prevFilters,
        [key]: newValue,
      };
    });
  };

  // **Modifica 5**: Funzione per resettare i filtri senza rimuovere altri parametri
  const clearFilters = () => {
    setFilters({
      authors: [],
      categories: [],
      genres: [],
      sort: "",
    });

    const currentParams = new URLSearchParams(searchParams);
    filterKeys.forEach((key) => currentParams.delete(key));

    router.replace(`${pathname}?${currentParams.toString()}`, { scroll: false });
  };

  return (
    <FilterContext.Provider
      value={{
        filters,
        setFilters, // ✅ Aggiunto qui
        updatePartialFilter,
        clearFilters,
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
