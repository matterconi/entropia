"use client";

import { useParams } from "next/navigation";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

// Interface per i conteggi
export interface FilterCount {
  id: string;
  name: string;
  count: number;
}

export interface FilterCounts {
  categories?: FilterCount[];
  genres?: FilterCount[];
  topics?: FilterCount[];
}

interface FilterCountsContextType {
  filterCounts: FilterCounts;
  isLoadingCounts: boolean;
  lastFetchTime?: number; // Tempo impiegato per l'ultima richiesta in ms
}

// Contesto
const FilterCountsContext = createContext<FilterCountsContextType | undefined>(
  undefined,
);

// Provider
export function FilterCountsProvider({ children }: { children: ReactNode }) {
  const params = useParams();
  const [filterCounts, setFilterCounts] = useState<FilterCounts>({});
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>();

  // Determina quale parametro è presente nella route
  const { categoria, genere, topic } = params;

  // Carica i conteggi solo all'inizio
  useEffect(() => {
    const fetchFilterCounts = async () => {
      try {
        setIsLoadingCounts(true);

        // Determina il tipo di pagina e il valore
        let pageType = "";
        let pageValue = "";

        if (categoria) {
          pageType = "categorie";
          pageValue = Array.isArray(categoria) ? categoria[0] : categoria;
        } else if (genere) {
          pageType = "generi";
          pageValue = Array.isArray(genere) ? genere[0] : genere;
        } else if (topic) {
          pageType = "topics";
          pageValue = Array.isArray(topic) ? topic[0] : topic;
        }

        // Misurazione delle prestazioni
        const startTime = performance.now();

        // Costruisci l'URL con i parametri della pagina attuale
        const url = new URL("/api/filter-counts", window.location.origin);

        // Aggiungi il tipo di pagina e il valore
        if (pageType && pageValue) {
          url.searchParams.append("pageType", pageType);
          url.searchParams.append("pageValue", pageValue);
        }

        const response = await fetch(url.toString());

        // Calcola il tempo impiegato
        const endTime = performance.now();
        const fetchTime = endTime - startTime;
        setLastFetchTime(parseFloat(fetchTime.toFixed(2)));

        if (response.ok) {
          const data = await response.json();
          setFilterCounts(data);
        } else {
          console.error("Errore nel caricamento dei conteggi dei filtri");
        }
      } catch (error) {
        console.error("Errore nel recupero dei conteggi dei filtri:", error);
      } finally {
        setIsLoadingCounts(false);
      }
    };

    fetchFilterCounts();
  }, [categoria, genere, topic]); // Dipendenze: ricarica solo quando cambia la route

  // Valori esposti dal context
  const value = {
    filterCounts,
    isLoadingCounts,
    lastFetchTime,
  };

  return (
    <FilterCountsContext.Provider value={value}>
      {children}
    </FilterCountsContext.Provider>
  );
}

// Custom hook
export function useFilterCounts() {
  const context = useContext(FilterCountsContext);

  if (context === undefined) {
    throw new Error(
      "useFilterCounts must be used within a FilterCountsProvider",
    );
  }

  return context;
}
