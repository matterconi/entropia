"use client";

import { useParams } from "next/navigation"; // Import per leggere i parametri della route
import React from "react";

import SortPost from "@/components/filters/shared/SortPost";
import { useFilterContext } from "@/context/FilterContext";
import { getFiltersConfig } from "@/data/filterConfig";

import FilterChips from "./shared/FilterChips";
import SelectMenu from "./shared/SelectMenu";

interface Filter {
  id: string;
  label: string;
  componentType?: "chips" | "select" | "checkbox" | "multiselect" | "radio"; // Aggiunti i tipi mancanti
  options: { value: string; label: string }[];
}

const RenderFilterComponent = (filter: Filter) => {
  const { filters, updatePartialFilter } = useFilterContext();
  const handleChange = (value: string | string[]) =>
    updatePartialFilter(filter.id, value);
  if (filter.id === "sort") {
    return (
      <FilterSection label={filter.label}>
        <SortPost
          options={filter.options}
          onChange={handleChange}
          label={filters[filter.id] || "Data"}
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

  return (
    <div className="w-screen bg-white rounded-lg p-6 overflow-y-visible max-h-full flex px-12">
      {/* Form per i filtri */}
      <form className="pt-0 flex items-start justify-center space-x-8 w-full">
        {visibleFilters.map((filter) => (
          <div key={filter.label}>{RenderFilterComponent(filter)}</div>
        ))}
      </form>
    </div>
  );
};

export default DeskFilterMenu;
