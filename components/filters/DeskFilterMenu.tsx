"use client";

import React, { useMemo } from "react";

import SortPost from "@/components/filters/shared/SortPost";
import { useFilterContext } from "@/context/FilterContext";
import { useFilterCounts } from "@/context/FilterCountsContext";

import FilterChips from "./shared/FilterChips";
import SelectMenu from "./shared/SelectMenu";

interface Filter {
  id: string;
  label: string;
  componentType?: "chips" | "select" | "checkbox" | "multiselect" | "radio";
  options: { value: string; label: string; count?: number; id?: string }[];
}

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

const RenderFilterComponent = (filter: Filter) => {
  const { filters, updatePartialFilter } = useFilterContext();

  const handleChange = (value: string | string[]) =>
    updatePartialFilter(filter.id, value);

  // Se non ci sono opzioni da mostrare e non è il filtro sort, non renderizzare
  if (filter.options.length === 0 && filter.id !== "sort") {
    return null;
  }

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
          onChange={handleChange}
          label={
            typeof filters[filter.id] === "string" && filters[filter.id] !== ""
              ? (filters[filter.id] as string)
              : defaultOption
          }
          selectedOption={
            typeof filters[filter.id] === "string" && filters[filter.id] !== ""
              ? (filters[filter.id] as string)
              : defaultOption
          }
        />
      </FilterSection>
    );
  }

  if (filter.componentType === "chips") {
    return (
      <div className="pt-2 md:pt-0">
        <FilterChips
          label={filter.label}
          options={filter.options}
          selectedOptions={filters[filter.id] || []}
          onChange={handleChange}
        />
      </div>
    );
  }

  return (
    <SelectMenu
      label={filter.label}
      options={filter.options}
      selectedOptions={filters[filter.id] || []}
      onChange={handleChange}
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
      <label className="block text-gradient animated-gradient font-semibold">
        {label}
      </label>
      {children}
    </div>
  );
};

const DeskFilterMenu = () => {
  const { isLoadingCounts, filterCounts } = useFilterCounts();

  // Genera dinamicamente i filtri basandosi direttamente sui dati di filterCounts
  const dynamicFilters = useMemo(() => {
    if (!filterCounts || isLoadingCounts) return [];

    const filters: Filter[] = [];

    // Genera filtro per categorie se presente
    if (filterCounts.categories && filterCounts.categories.length > 0) {
      filters.push({
        id: "categories",
        label: "Categorie",
        componentType: "chips",
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
        componentType: "chips",
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
        componentType: "chips",
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

  return (
    <div className="w-screen bg-white rounded-lg p-6 overflow-y-visible max-h-full flex px-12">
      {/* Form per i filtri */}
      <form className="pt-0 flex items-start justify-center space-x-8 w-full">
        {isLoadingCounts ? (
          <div className="text-muted-foreground text-sm">
            Caricamento filtri in corso...
          </div>
        ) : (
          dynamicFilters.map((filter) => (
            <div key={filter.id}>{RenderFilterComponent(filter)}</div>
          ))
        )}
      </form>
    </div>
  );
};

export default DeskFilterMenu;
