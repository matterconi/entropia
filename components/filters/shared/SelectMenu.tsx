"use client";

import "./popOverStyles.css";

import React, { useId, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { AuthorInput } from "../../ui/AuthorInput";

interface SelectMenuProps {
  label: string;
  options: {
    value: string;
    label: string;
    count?: number; // Aggiungiamo il count come proprietà opzionale
    id?: string;
  }[];
  selectedOptions: string | string[];
  onChange: (selected: string[]) => void;
}

const SelectMenu: React.FC<SelectMenuProps> = ({
  label,
  options,
  selectedOptions,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // Stato per la ricerca
  const uniqueId = useId();

  // Assicuriamoci che selectedOptions sia sempre un array
  const selectedOptionsArray = Array.isArray(selectedOptions)
    ? selectedOptions
    : [];

  const handleToggle = (value: string) => {
    if (selectedOptionsArray.includes(value)) {
      onChange(selectedOptionsArray.filter((option) => option !== value));
    } else {
      onChange([...selectedOptionsArray, value]);
    }
  };

  // Filtra gli autori basandosi sulla ricerca (case insensitive)
  const filteredOptions =
    label === "Autori"
      ? options.filter((option) =>
          option.label.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : options;

  return (
    <div className="relative w-full min-w-[250px]">
      <Popover onOpenChange={(open) => setIsOpen(open)}>
        {/* Trigger del Popover */}
        <PopoverTrigger asChild>
          <div className="w-full h-full border-gradient animated-gradient p-[1px] my-4 md:my-0 rounded-lg ">
            <div className="w-full h-full bg-background rounded-lg">
              <button
                className="w-full rounded-lg px-4 py-2 flex justify-between items-center"
                type="button"
              >
                <h3 className="font-semibold text-sm">{label}</h3>
                <div className="flex items-center justify-center">
                  {selectedOptionsArray.length > 0 && (
                    <div className="text-sm pr-4">
                      ({selectedOptionsArray.length})
                    </div>
                  )}
                  <svg width="0" height="0" className="absolute">
                    <defs>
                      <linearGradient
                        id={`gradient-${uniqueId}`}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%">
                          <animate
                            attributeName="stop-color"
                            values="#00f5ff; #ff00f7; #ffb400; #00f5ff"
                            dur="3s"
                            repeatCount="indefinite"
                          />
                        </stop>
                        <stop offset="50%">
                          <animate
                            attributeName="stop-color"
                            values="#ff00f7; #ffb400; #00f5ff; #ff00f7"
                            dur="3s"
                            repeatCount="indefinite"
                          />
                        </stop>
                        <stop offset="100%">
                          <animate
                            attributeName="stop-color"
                            values="#ffb400; #00f5ff; #ff00f7; #ffb400"
                            dur="3s"
                            repeatCount="indefinite"
                          />
                        </stop>
                      </linearGradient>
                    </defs>
                  </svg>
                  {isOpen ? (
                    <FaChevronUp
                      size={20}
                      style={{
                        fill: `url(#gradient-${uniqueId})`,
                        filter: "drop-shadow(0 0 4px rgba(255, 0, 128, 0.5))",
                        transition: "transform 0.3s ease",
                      }}
                    />
                  ) : (
                    <FaChevronDown
                      size={20}
                      style={{
                        fill: `url(#gradient-${uniqueId})`,
                        filter: "drop-shadow(0 0 4px rgba(255, 0, 128, 0.5))",
                        transition: "transform 0.3s ease",
                      }}
                    />
                  )}
                </div>
              </button>
            </div>
          </div>
        </PopoverTrigger>

        {/* Contenuto del Popover */}
        <PopoverContent
          className="my-4 PopoverContent rounded-lg shadow-lg"
          align="start"
        >
          <div className="w-full h-full border-gradient p-[1px] rounded-lg animated-gradient">
            <div className="px-6 p-4 bg-background rounded-lg">
              <div className="space-y-2">
                {/* Input di ricerca se la label è "Autori" */}
                {label === "Autori" && options.length > 1 && (
                  <AuthorInput
                    placeholder="Cerca autore"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                )}

                {/* Lista filtrata */}
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedOptionsArray.includes(option.value)}
                        onCheckedChange={() => handleToggle(option.value)}
                      />
                      <span className="text-sm flex-1 truncate">
                        {option.label}
                        {/* Mostra il conteggio se disponibile */}
                        {option.count !== undefined && (
                          <span
                            className={`ml-1 text-xs text-muted-foreground
                            }`}
                          >
                            ({option.count})
                          </span>
                        )}
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Nessun risultato</p>
                )}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SelectMenu;
