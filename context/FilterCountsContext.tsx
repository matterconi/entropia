"use client";

import { useParams } from "next/navigation";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// Interfacce per i conteggi
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
  refreshCounts: (customFilters?: Record<string, string[]>) => Promise<void>;
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

  // Teniamo traccia dei parametri correnti della pagina in un ref
  const pageParamsRef = useRef({ pageType: "", pageValue: "" });

  // Determina quale parametro è presente nella route
  const { categoria, genere, topic } = params;

  // Aggiorna il ref con i valori correnti
  useEffect(() => {
    let pageType = "";
    let pageValue = "";

    if (categoria) {
      pageType = "categoria";
      pageValue = Array.isArray(categoria) ? categoria[0] : categoria;
    } else if (genere) {
      pageType = "genere";
      pageValue = Array.isArray(genere) ? genere[0] : genere;
    } else if (topic) {
      pageType = "topic";
      pageValue = Array.isArray(topic) ? topic[0] : topic;
    }

    // Aggiorna il ref solo se i valori sono cambiati
    if (
      pageParamsRef.current.pageType !== pageType ||
      pageParamsRef.current.pageValue !== pageValue
    ) {
      console.log("Route params changed:", pageType, pageValue);
      pageParamsRef.current = { pageType, pageValue };
    }
  }, [categoria, genere, topic]);

  // Funzione per caricare i conteggi dei filtri
  // Usa i valori dal ref, quindi non ha dipendenze sui valori stessi
  const fetchFilterCounts = useCallback(
    async (customFilters?: Record<string, string[]>) => {
      try {
        const { pageType, pageValue } = pageParamsRef.current;

        setIsLoadingCounts(true);

        // Misurazione delle prestazioni
        const startTime = performance.now();

        // Costruisci l'URL con i parametri della pagina attuale
        const url = new URL("/api/filter-counts", window.location.origin);

        // Aggiungi il tipo di pagina e il valore
        if (pageType && pageValue) {
          url.searchParams.append("pageType", pageType);
          url.searchParams.append("pageValue", pageValue);
        }

        // Aggiungi eventuali filtri personalizzati
        if (customFilters) {
          for (const [key, values] of Object.entries(customFilters)) {
            if (values && values.length > 0) {
              url.searchParams.append(key, values.join(","));
            }
          }
        }

        console.log("Fetching filter counts:", url.toString());
        const response = await fetch(url.toString());

        // Calcola il tempo impiegato
        const endTime = performance.now();
        const fetchTime = endTime - startTime;
        setLastFetchTime(parseFloat(fetchTime.toFixed(2)));
        console.log(`Filter counts fetched in ${fetchTime.toFixed(2)}ms`);

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
    },
    [], // Ora non ci sono dipendenze che causano problemi con ESLint
  );

  // Crea un tracciatore separato per la verifica degli aggiornamenti
  const prevParamsRef = useRef({ pageType: "", pageValue: "" });

  // Carica i conteggi solo quando cambiano i parametri della route
  useEffect(() => {
    const { pageType, pageValue } = pageParamsRef.current;

    // Verifica se i parametri della pagina sono cambiati rispetto all'ultimo caricamento
    if (
      prevParamsRef.current.pageType !== pageType ||
      prevParamsRef.current.pageValue !== pageValue
    ) {
      console.log("Loading filter counts for:", pageType, pageValue);
      fetchFilterCounts();

      // Aggiorna il riferimento per il prossimo confronto
      prevParamsRef.current = { pageType, pageValue };
    }
  }, [categoria, genere, topic, fetchFilterCounts]);

  // Valori esposti dal context
  const value = {
    filterCounts,
    isLoadingCounts,
    refreshCounts: fetchFilterCounts,
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
