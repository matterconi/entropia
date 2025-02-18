"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { IoClose } from "react-icons/io5";
import { z } from "zod";

import FilterChips from "@/components/shared/FilterChips"; // Importiamo i chip
import SelectMenu from "@/components/shared/SelectMenu";
import SortPost from "@/components/shared/SortPost";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { useFilterContext } from "@/context/FilterContext";
import { filtersConfig } from "@/data/filterConfig";

const filtersSchema = z.object({
  authors: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  genres: z.array(z.string()).optional(),
  sort: z.string().optional(),
});

interface FilterOption {
  label: string;
  value: string;
}

interface Filters {
  [key: string]: string | string[];
  authors: string[];
  categories: string[];
  genres: string[];
  sort: string;
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

const renderFilterComponent = (filter: Filter, field: Field) => {
  if (filter.id === "sort") {
    return (
      <FilterSection label={filter.label}>
        <SortPost
          options={filter.options}
          onChange={field.onChange}
          label={typeof field.value === "string" ? field.value : "Data"}
          selectedOption={typeof field.value === "string" ? field.value : null}
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
          {filtersConfig.map((filter) => (
            <Controller
              key={filter.id}
              name={filter.id}
              control={form.control}
              render={({ field }) => (
                <div>{renderFilterComponent(filter, field)}</div>
              )}
            />
          ))}

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
