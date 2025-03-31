"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { IoClose } from "react-icons/io5";
import { z } from "zod";

import FilterChips from "@/components/filters/shared/FilterChips";
import SelectMenu from "@/components/filters/shared/SelectMenu";
import SortPost from "@/components/filters/shared/SortPost";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { useFilterContext } from "@/context/FilterContext";
import { useFilterCounts } from "@/context/FilterCountsContext";

// Schema per la validazione
const filtersSchema = z.object({
  authors: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  genres: z.array(z.string()).optional(),
  topics: z.array(z.string()).optional(),
  sort: z.string().optional(),
});

interface Filters {
  [key: string]: string | string[];
  authors: string[];
  categories: string[];
  genres: string[];
  topics: string[];
  sort: string;
  query: string;
}

interface Filter {
  id: string;
  label: string;
  componentType?:
    | "sort"
    | "select"
    | "chips"
    | "checkbox"
    | "multiselect"
    | "radio";
  options: { label: string; value: string; count?: number; id?: string }[];
}

interface Field {
  value: string | string[];
  onChange: (value: string | string[]) => void;
}

// Componente per renderizzare un filtro
const FilterComponent = ({
  filter,
  field,
}: {
  filter: Filter;
  field: Field;
}) => {
  // Se non ci sono opzioni da mostrare e non è il filtro sort, non renderizzare
  if (filter.options.length === 0 && filter.id !== "sort") {
    return null;
  }

  // Handle SortPost
  if (filter.id === "sort") {
    const defaultOption =
      filter.options.find(
        (opt) => opt.value === "Più Recenti" || opt.value === "new",
      )?.value ||
      filter.options.find(
        (opt) => opt.label === "Più recenti" || opt.label === "new",
      )?.value ||
      filter.options[0]?.value ||
      "Più recenti";

    return (
      <FilterSection label={filter.label}>
        <SortPost
          options={filter.options}
          onChange={field.onChange}
          label={
            typeof field.value === "string" && field.value !== ""
              ? field.value
              : defaultOption
          }
          selectedOption={
            typeof field.value === "string" && field.value !== ""
              ? field.value
              : defaultOption
          }
        />
      </FilterSection>
    );
  }

  if (filter.componentType === "chips") {
    return (
      <div className="pt-2">
        <FilterChips
          label={filter.label}
          options={filter.options}
          selectedOptions={field.value}
          onChange={field.onChange}
        />
      </div>
    );
  }

  return (
    <SelectMenu
      label={filter.label}
      options={filter.options}
      selectedOptions={field.value}
      onChange={field.onChange}
    />
  );
};

interface FilterSectionProps {
  label: string;
  children: React.ReactNode;
}

const FilterSection: React.FC<FilterSectionProps> = ({ label, children }) => {
  return (
    <div className="mb-4">
      <label className="block text-gradient animated-gradient font-semibold pt-4">
        {label}
      </label>
      {children}
    </div>
  );
};

// Configurazione statica per il filtro di ordinamento
const SORT_FILTER = {
  id: "sort",
  label: "Ordina per",
  componentType: "radio",
  options: [
    { value: "alphabetical", label: "Ordine Alfabetico" },
    { value: "new", label: "Più recenti" },
    { value: "old", label: "Più vecchi" },
    { value: "views", label: "Visualizzazioni" },
    { value: "likes", label: "Like" },
  ],
};

interface MobileFilterMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileFilterMenu: React.FC<MobileFilterMenuProps> = ({
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 1200px)").matches;

    if (isOpen && isMobile) {
      document.body.style.overflowY = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const { filters, updateFilters } = useFilterContext();
  const { isLoadingCounts, filterCounts } = useFilterCounts();

  // Genera dinamicamente i filtri basandosi direttamente sui dati di filterCounts
  const dynamicFilters = useMemo(() => {
    if (!filterCounts || isLoadingCounts) return [];

    const isMobile =
      typeof window !== "undefined" ? window.innerWidth < 768 : false;
    const filters: Filter[] = [];

    // Genera filtro per categorie se presente
    if (filterCounts.categories && filterCounts.categories.length > 0) {
      filters.push({
        id: "categories",
        label: "Categorie",
        componentType: isMobile ? "multiselect" : "chips",
        options: filterCounts.categories.map((cat) => ({
          value: cat.name,
          label: cat.name,
          count: cat.count,
          id: cat.id,
        })),
      });
    }

    // Genera filtro per generi se presente
    if (filterCounts.genres && filterCounts.genres.length > 0) {
      filters.push({
        id: "genres",
        label: "Generi",
        componentType: isMobile ? "multiselect" : "chips",
        options: filterCounts.genres.map((genre) => ({
          value: genre.name,
          label: genre.name,
          count: genre.count,
          id: genre.id,
        })),
      });
    }

    // Genera filtro per topics se presente
    if (filterCounts.topics && filterCounts.topics.length > 0) {
      filters.push({
        id: "topics",
        label: "Topics",
        componentType: isMobile ? "multiselect" : "chips",
        options: filterCounts.topics.map((topic) => ({
          value: topic.name,
          label: topic.name,
          count: topic.count,
          id: topic.id,
        })),
      });
    }

    // Aggiungi il filtro di ordinamento (sempre presente)
    filters.push(SORT_FILTER);

    return filters;
  }, [filterCounts, isLoadingCounts]);

  const form = useForm({
    resolver: zodResolver(filtersSchema),
    defaultValues: filters,
  });

  const onSubmit = (data: Filters) => {
    updateFilters(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-300 bg-opacity-70 z-50 flex items-center justify-center">
      <div className="w-4/5 max-w-lg bg-white rounded-lg shadow-lg p-6 overflow-y-visible max-h-full">
        <div className="w-full flex justify-between items-center mb-2 mt-4">
          <h2 className="font-semibold text-gradient animated-gradient">
            Filtri
          </h2>
          <button onClick={onClose}>
            <IoClose size={25} />
          </button>
        </div>

        {/* Form per i filtri */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
          {isLoadingCounts ? (
            <div className="text-muted-foreground text-sm py-4">
              Caricamento filtri in corso...
            </div>
          ) : (
            dynamicFilters.map((filter) => (
              <Controller
                key={filter.id}
                name={filter.id}
                control={form.control}
                render={({ field }) => (
                  <FilterComponent filter={filter} field={field} />
                )}
              />
            ))
          )}

          {/* Bottone per applicare i filtri */}
          <div className="pt-8 pb-4">
            <RainbowButton className="w-full" type="submit">
              <p className="text-lg">Applica Filtri</p>
            </RainbowButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MobileFilterMenu;
