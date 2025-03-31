"use client";

import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";

import { CheckCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import type { Swiper } from "swiper";
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper as SwiperReact, SwiperSlide } from "swiper/react";

import { useFilterContext } from "@/context/FilterContext";
import { useFilterCounts } from "@/context/FilterCountsContext";

const FilterSlider = () => {
  const { filters, updatePartialFilter } = useFilterContext();
  const { filterCounts, isLoadingCounts } = useFilterCounts();

  // Stato per tenere traccia dei filtri selezionati per ciascun tipo di filtro
  const [selectedFilters, setSelectedFilters] = useState({
    categories: Array.isArray(filters.categories)
      ? [...filters.categories]
      : [],
    genres: Array.isArray(filters.genres) ? [...filters.genres] : [],
    topics: Array.isArray(filters.topics) ? [...filters.topics] : [],
  });

  const [isScrollable, setIsScrollable] = useState(false);
  const [swiperInstance, setSwiperInstance] = useState<Swiper | null>(null);

  // Controlla se un elemento è selezionato
  const isItemSelected = (
    filterType: "categories" | "genres" | "topics",
    title: string,
  ) => {
    return selectedFilters[filterType].includes(title);
  };

  // Sincronizza lo stato locale con i filtri globali
  useEffect(() => {
    setSelectedFilters({
      categories: Array.isArray(filters.categories)
        ? [...filters.categories]
        : [],
      genres: Array.isArray(filters.genres) ? [...filters.genres] : [],
      topics: Array.isArray(filters.topics) ? [...filters.topics] : [],
    });
  }, [filters]);

  // Gestisce il click su un elemento del filtro
  const handleClick = (
    filterType: "categories" | "genres" | "topics",
    item: string,
  ) => {
    // Copia l'array attuale dei filtri di questo tipo
    const currentFilters = [...selectedFilters[filterType]];

    // Se l'elemento è già selezionato, lo rimuoviamo
    if (currentFilters.includes(item)) {
      const updatedFilters = currentFilters.filter((filter) => filter !== item);

      // Aggiorna lo stato locale
      setSelectedFilters({
        ...selectedFilters,
        [filterType]: updatedFilters,
      });

      // Aggiorna il contesto globale dei filtri
      updatePartialFilter(filterType, updatedFilters);
    } else {
      // Altrimenti, aggiungiamo l'elemento ai filtri esistenti
      const updatedFilters = [...currentFilters, item];

      // Aggiorna lo stato locale
      setSelectedFilters({
        ...selectedFilters,
        [filterType]: updatedFilters,
      });

      // Aggiorna il contesto globale dei filtri
      updatePartialFilter(filterType, updatedFilters);
    }
  };

  // Aggiorna lo stato isScrollable con un leggero ritardo
  const updateScrollableState = React.useCallback(() => {
    setTimeout(() => {
      if (swiperInstance) {
        setIsScrollable(!swiperInstance.isLocked);
      }
    }, 50);
  }, [swiperInstance]);

  // Aggiunge listener per il resize e cambiamenti fullscreen
  useEffect(() => {
    window.addEventListener("resize", updateScrollableState);
    document.addEventListener("fullscreenchange", updateScrollableState);

    return () => {
      window.removeEventListener("resize", updateScrollableState);
      document.removeEventListener("fullscreenchange", updateScrollableState);
    };
  }, [updateScrollableState]);

  // Prepara i dati per lo slider direttamente dai filterCounts
  const prepareFilterItems = () => {
    const items = [];

    // Aggiungi categorie se presenti
    if (filterCounts.categories && filterCounts.categories.length > 0) {
      filterCounts.categories.forEach((category) => {
        items.push({
          filterType: "categories" as const,
          title: category.name,
          id: category.id,
          count: category.count,
        });
      });
    }

    // Aggiungi generi se presenti
    if (filterCounts.genres && filterCounts.genres.length > 0) {
      filterCounts.genres.forEach((genre) => {
        items.push({
          filterType: "genres" as const,
          title: genre.name,
          id: genre.id,
          count: genre.count,
        });
      });
    }

    // Aggiungi topic se presenti
    if (filterCounts.topics && filterCounts.topics.length > 0) {
      filterCounts.topics.forEach((topic) => {
        items.push({
          filterType: "topics" as const,
          title: topic.name,
          id: topic.id,
          count: topic.count,
        });
      });
    }

    // Ordina per conteggio in ordine decrescente
    return items.sort((a, b) => (b.count || 0) - (a.count || 0));
  };

  const filterItems = prepareFilterItems();

  // Se stiamo ancora caricando i conteggi e non abbiamo dati, mostra un messaggio
  if (isLoadingCounts) {
    return (
      <div className="relative overflow-x-hidden pr-6 py-3 text-sm text-muted-foreground">
        Caricamento filtri in corso...
      </div>
    );
  }

  // Se non ci sono filtri disponibili, nascondi completamente il componente
  if (filterItems.length === 0 && !isLoadingCounts) {
    return null;
  }

  return (
    <div className="relative overflow-x-hidden pr-6">
      {isScrollable && (
        <>
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background via-background/70 to-transparent pointer-events-none z-10"></div>
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background via-background/70 to-transparent pointer-events-none z-10"></div>
        </>
      )}

      <SwiperReact
        modules={[Navigation, Autoplay]}
        autoplay={{
          delay: 1500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={false}
        spaceBetween={20}
        slidesPerView="auto"
        className="!overflow-hidden"
        onSwiper={(swiper) => {
          setSwiperInstance(swiper);
          setTimeout(() => {
            setIsScrollable(!swiper.isLocked);
          }, 50);
        }}
      >
        {filterItems.map((item) => {
          const isSelected = isItemSelected(item.filterType, item.title);

          return (
            <SwiperSlide
              key={`${item.filterType}-${item.id}`}
              className="!w-auto flex items-center justify-center"
            >
              <div className="dark:w-full dark:h-full border-gradient p-[1px] rounded-lg animated-gradient">
                <div className="w-full h-full bg-background rounded-lg p-1">
                  <button
                    onClick={() => handleClick(item.filterType, item.title)}
                    className={`cursor-pointer flex items-center justify-center rounded-lg px-2 py-1 transition-all duration-300 ${
                      isSelected ? "text-green-500" : "text-foreground"
                    }`}
                  >
                    <p className="text-xs font-semibold flex items-center justify-center w-full h-full">
                      <span
                        className={`transition-all duration-300 flex justify-center ${
                          isSelected ? "w-4" : "w-2"
                        }`}
                      >
                        <CheckCircle
                          size={16}
                          className={`transition-all duration-300 text-green-500 ${
                            isSelected
                              ? "opacity-100 scale-100"
                              : "opacity-0 scale-0"
                          }`}
                        />
                      </span>
                      <span
                        className={`text-center transition-all duration-300 ${
                          isSelected
                            ? "pl-1 text-green-500"
                            : "px-[2px] text-foreground"
                        }`}
                      >
                        {item.title}
                        {item.count !== undefined && (
                          <span
                            className={`ml-1 text-xs ${isSelected ? "text-green-500/70" : "text-muted-foreground"}`}
                          >
                            ({item.count})
                          </span>
                        )}
                      </span>
                      <span className={`${isSelected ? "w-0" : "w-2"}`}></span>
                    </p>
                  </button>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </SwiperReact>
    </div>
  );
};

export default FilterSlider;
