"use client";

import { useParams } from "next/navigation"; // Import per leggere i parametri della route
import React, { useMemo } from "react";

import SortPost from "@/components/filters/shared/SortPost";
import { useFilterContext } from "@/context/FilterContext";
import { useFilterCounts } from "@/context/FilterCountsContext";
import { getFiltersConfig } from "@/data/filterConfig";

import FilterChips from "./shared/FilterChips";
import SelectMenu from "./shared/SelectMenu";

interface Filter {
  id: string;
  label: string;
  componentType?: "chips" | "select" | "checkbox" | "multiselect" | "radio";
  options: { value: string; label: string }[];
}

// Funzione per aggiungere i conteggi alle opzioni dei filtri e filtrare quelle senza articoli
const processFilterOptions = (
  filter: Filter,
  filterCounts: any,
  selectedOptions: string[] = [],
) => {
  // Se non abbiamo conteggi per questo tipo di filtro, restituiamo le opzioni originali
  if (!filterCounts[filter.id]) {
    return filter.options;
  }

  // Prima aggiungiamo i conteggi a tutte le opzioni
  const optionsWithCounts = filter.options.map((option) => {
    // Cerca il conteggio corrispondente a questa opzione
    const countItem = filterCounts[filter.id]?.find(
      (item: { name: string }) => item.name === option.label,
    );

    // Se troviamo un conteggio, lo aggiungiamo all'opzione
    if (countItem) {
      return {
        ...option,
        count: countItem.count,
      };
    }

    // Altrimenti, impostiamo esplicitamente count a 0
    return {
      ...option,
      count: 0, // Impostiamo esplicitamente a 0 anziché lasciare undefined
    };
  });

  // Poi filtriamo le opzioni per mostrare solo quelle con count > 0 o già selezionate
  return optionsWithCounts.filter((option) => {
    const isSelected = selectedOptions.includes(option.value);
    return isSelected || (option.count !== undefined && option.count > 0);
  });
};

const RenderFilterComponent = (filter: Filter) => {
  const { filters, updatePartialFilter } = useFilterContext();
  const { filterCounts } = useFilterCounts();

  const handleChange = (value: string | string[]) =>
    updatePartialFilter(filter.id, value);

  // Processa le opzioni (aggiungi conteggi e filtra)
  const processedOptions = useMemo(() => {
    // Ottieni l'array di opzioni selezionate per questo filtro
    const selectedOptions: string[] = Array.isArray(filters[filter.id])
      ? (filters[filter.id] as string[])
      : typeof filters[filter.id] === "string"
        ? [filters[filter.id] as string]
        : [];

    return processFilterOptions(filter, filterCounts, selectedOptions);
  }, [filter, filterCounts, filters]);

  // Se non ci sono opzioni da mostrare dopo il filtraggio, non renderizzare il componente
  if (processedOptions.length === 0 && filter.id !== "sort") {
    return null;
  }

  if (filter.id === "sort") {
    return (
      <FilterSection label={filter.label}>
        <SortPost
          options={filter.options}
          onChange={handleChange}
          label={filters[filter.id] || "Più Recenti"}
          selectedOption={filters[filter.id]}
        />
      </FilterSection>
    );
  }

  if (filter.componentType === "chips") {
    return (
      <div className="pt-2 md:pt-0">
        <FilterChips
          label={filter.label}
          options={processedOptions}
          selectedOptions={filters[filter.id] || []}
          onChange={handleChange}
        />
      </div>
    );
  }

  return (
    <SelectMenu
      label={filter.label}
      options={processedOptions}
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
  const params = useParams(); // Legge i parametri dalla route
  const { categoria, genere, topic } = params; // Controlliamo quale parametro è presente
  const { isLoadingCounts } = useFilterCounts();

  // Determina quale filtro nascondere in base alla route
  let filterToRemove = "";
  if (categoria) filterToRemove = "categories";
  if (genere) filterToRemove = "genres";
  if (topic) filterToRemove = "topics";

  // Filtra i filtri visibili
  const filtersConfig = getFiltersConfig();

  const visibleFilters = filtersConfig.filter(
    (filter) => filter.id !== filterToRemove,
  );

  return (
    <div className="w-screen bg-white rounded-lg p-6 overflow-y-visible max-h-full flex px-12">
      {/* Form per i filtri */}
      <form className="pt-0 flex items-start justify-center space-x-8 w-full">
        {isLoadingCounts ? (
          <div className="text-muted-foreground text-sm">
            Caricamento filtri in corso...
          </div>
        ) : (
          visibleFilters.map((filter) => (
            <div key={filter.label}>{RenderFilterComponent(filter)}</div>
          ))
        )}
      </form>
    </div>
  );
};

export default DeskFilterMenu;
