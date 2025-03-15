"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation"; // Import per leggere i parametri della route
import React, { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { IoClose } from "react-icons/io5";
import { z } from "zod";

import FilterChips from "@/components/filters/shared/FilterChips"; // Importiamo i chip
import SelectMenu from "@/components/filters/shared/SelectMenu";
import SortPost from "@/components/filters/shared/SortPost";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { useFilterContext } from "@/context/FilterContext";
import { useFilterCounts } from "@/context/FilterCountsContext";
import { getFiltersConfig } from "@/data/filterConfig";

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
    | "radio"; // ✅ Expanded to match all cases
  options: { label: string; value: string }[];
}

interface Field {
  value: string | string[];
  onChange: (value: string | string[]) => void;
}

// Funzione per processare le opzioni dei filtri (aggiungere conteggi e filtrare)
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

// Componente per renderizzare i filtri
const FilterComponent = ({
  filter,
  field,
}: {
  filter: Filter;
  field: Field;
}) => {
  const { filterCounts } = useFilterCounts();

  // Processa le opzioni (aggiungi conteggi e filtra)
  const processedOptions = useMemo(() => {
    // Ottieni l'array di opzioni selezionate all'interno del callback
    const selectedOptions = Array.isArray(field.value)
      ? field.value
      : field.value
        ? [field.value]
        : [];
    return processFilterOptions(filter, filterCounts, selectedOptions);
  }, [filter, filterCounts, field.value]);

  // Se non ci sono opzioni da mostrare dopo il filtraggio e non è il filtro sort, non renderizzare
  if (processedOptions.length === 0 && filter.id !== "sort") {
    return null;
  }

  // This fixes the issue with SortPost not having a default valueat
  // SortPost con Data come opzione di default
  if (filter.id === "sort") {
    // Prioritizziamo "Data" come valore di default
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
          options={processedOptions}
          selectedOptions={field.value}
          onChange={field.onChange}
        />
      </div>
    );
  }

  return (
    <SelectMenu
      label={filter.label}
      options={processedOptions}
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

interface MobileFilterMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileFilterMenu: React.FC<MobileFilterMenuProps> = ({
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 1200px)").matches; // lg:hidden corrisponde a max-width: 1024px

    if (isOpen && isMobile) {
      document.body.style.overflowY = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto"; // Ripristina lo scroll quando il componente si smonta
    };
  }, [isOpen]);

  const { filters, updateFilters } = useFilterContext();
  const { isLoadingCounts } = useFilterCounts(); // Aggiungiamo l'accesso ai conteggi

  const params = useParams(); // Legge i parametri dalla route
  const { categoria, genere, topic } = params; // Controlliamo quale parametro è presente

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
            visibleFilters.map((filter) => (
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
