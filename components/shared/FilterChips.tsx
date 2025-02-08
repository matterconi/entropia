"use client";

import { CheckCircle } from "lucide-react";
import React from "react";

import { Badge, badgeVariants } from "@/components/ui/badge";

interface FilterChipsProps {
  label: string;
  options: { value: string; label: string }[];
  selectedOptions: string[];
  onChange: (selected: string[]) => void;
}

const FilterChips: React.FC<FilterChipsProps> = ({
  label,
  options,
  selectedOptions,
  onChange,
}) => {
  const handleSelect = (value: string) => {
    const newSelection = selectedOptions.includes(value)
      ? selectedOptions.filter((item) => item !== value) // Rimuove il valore se già selezionato
      : [...selectedOptions, value]; // Aggiunge il valore se non presente

    onChange(newSelection); // Notifica il componente padre
  };

  return (
    <div className="relative w-full mt-4 md:mt-0">
      {/* Testo sopra il bordo */}
      <span className="absolute -top-3 left-4 bg-background px-2 text-sm font-semibold text-foreground">
        {label}
      </span>

      {/* Contenitore delle chips */}
      <div className="w-full h-full border-gradient p-[1px] rounded-lg animated-gradient">
        <div className="flex flex-wrap gap-2 px-4 pt-6 pb-4 rounded-lg bg-background shadow-sm">
          {options.map((option) => {
            const isSelected = selectedOptions.includes(option.value);

            return (
              <Badge
                key={option.value}
                variant="outline"
                onClick={() => handleSelect(option.value)}
                className={`cursor-pointer flex items-center justify-center rounded-lg px-2 py-1 transition-all duration-300 ${
                  isSelected ? "text-green-500" : "text-foreground"
                }`}
              >
                <p className="text-xs font-semibold flex items-center justify-center w-full h-full">
                  {/* Area sinistra: icona con spazio bilanciato */}
                  <span
                    className={`transition-all duration-300 flex justify-center ${
                      isSelected ? "w-4" : "w-2"
                    }`}
                  >
                    <CheckCircle
                      size={16} // Manteniamo la dimensione costante
                      className={`transition-all duration-300 text-green-500 ${
                        isSelected
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-0"
                      }`}
                    />
                  </span>

                  {/* Contenuto centrale: padding dinamico */}
                  <span
                    className={`text-center transition-all duration-300 ${
                      isSelected
                        ? "pl-1 text-green-500"
                        : "px-[2px] text-foreground"
                    }`}
                  >
                    {option.label}
                  </span>

                  {/* Area destra: spazio di bilanciamento */}
                  <span className={`${isSelected ? "w-0" : "w-2"}`}></span>
                </p>
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FilterChips;
