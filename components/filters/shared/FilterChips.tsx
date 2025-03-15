"use client";

import { CheckCircle } from "lucide-react";
import React, { useMemo } from "react";

import { Badge, badgeVariants } from "@/components/ui/badge";

interface FilterChipsProps {
  label: string;
  options: { value: string; label: string; count?: number }[];
  selectedOptions: string | string[];
  onChange: (selected: string[]) => void;
}

const FilterChips: React.FC<FilterChipsProps> = ({
  label,
  options,
  selectedOptions,
  onChange,
}) => {
  const handleSelect = (value: string) => {
    const optionsArray = Array.isArray(selectedOptions) ? selectedOptions : [];

    const newSelection = optionsArray.includes(value)
      ? optionsArray.filter((item) => item !== value)
      : [...optionsArray, value];

    onChange(newSelection);
  };

  const selectedOptionsArray = useMemo(() => {
    return Array.isArray(selectedOptions)
      ? selectedOptions
      : selectedOptions
        ? [selectedOptions]
        : [];
  }, [selectedOptions]);

  // Filtra le opzioni in modo più rigoroso
  const filteredOptions = useMemo(() => {
    return options.filter((option) => {
      // Controlla se l'opzione è selezionata
      const isSelected = selectedOptionsArray.includes(option.value);

      // Verifica esplicitamente che count esista e sia maggiore di zero
      const hasPositiveCount = option.count !== undefined && option.count > 0;

      // Considera retrocompatibilità solo se esplicitamente undefined
      const isLegacyOption = option.count === undefined;

      // Mostra solo se selezionata O ha conteggio positivo O è un'opzione legacy
      return isSelected || hasPositiveCount || isLegacyOption;
    });
  }, [options, selectedOptionsArray]);

  // Se non ci sono opzioni da mostrare, non renderizzare nulla
  if (filteredOptions.length === 0) {
    return null;
  }

  // Log di debug per verificare cosa viene filtrato
  console.log("Opzioni originali:", options);
  console.log("Opzioni filtrate:", filteredOptions);
  console.log("Opzioni selezionate:", selectedOptionsArray);

  return (
    <div className="relative w-full mt-4 md:mt-0">
      {/* Testo sopra il bordo */}
      <span className="absolute -top-3 left-4 bg-background px-2 text-sm font-semibold text-foreground">
        {label}
      </span>

      {/* Contenitore delle chips */}
      <div className="w-full h-full border-gradient p-[1px] rounded-lg animated-gradient">
        <div className="flex flex-wrap gap-2 px-4 pt-6 pb-4 rounded-lg bg-background shadow-sm">
          {filteredOptions.map((option) => {
            const isSelected = selectedOptionsArray.includes(option.value);

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
                      size={16}
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
                    {/* Conteggio degli articoli */}
                    {option.count !== undefined && (
                      <span
                        className={`ml-1 text-xs ${
                          isSelected
                            ? "text-green-500/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        ({option.count})
                      </span>
                    )}
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
