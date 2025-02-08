"use client";

import React, { useId, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SelectMenuProps {
  label: string;
  options: { value: string; label: string }[];
  selectedOption: string | null;
  onChange: (value: string) => void;
}

const SelectMenu: React.FC<SelectMenuProps> = ({
  label,
  options,
  selectedOption,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false); // Stato per il trigger del popover
  const uniqueId = useId(); // Genera un ID univoco per il gradient

  const handleSelect = (value: string) => {
    onChange(value); // Notifica il genitore con l'opzione selezionata
    setIsOpen(false); // Chiudi il Popover
  };

  return (
    <div className="relative w-full min-w-[250px]">
      <Popover
        open={isOpen}
        onOpenChange={(open) => setIsOpen(open)} // Gestione dello stato del popover
      >
        {/* Trigger del Popover */}
        <PopoverTrigger asChild>
          <div className="w-full h-full border-gradient animated-gradient p-[1px] my-4 rounded-lg">
            <div className="w-full h-full bg-background rounded-lg">
              <button
                className="w-full rounded-lg px-4 py-2 flex justify-between items-center"
                type="button"
              >
                {/* Mostra il valore selezionato o il placeholder */}
                <h3 className="font-semibold text-foreground text-sm">
                  {selectedOption
                    ? options.find((opt) => opt.value === selectedOption)?.label
                    : label}
                </h3>
                <div className="flex items-center justify-center">
                  {/* Gradient Definition */}
                  <svg width="0" height="0" className="absolute">
                    <defs>
                      <linearGradient
                        id={`gradient-${uniqueId}`} // Usa l'ID unico
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

                  {/* Icona Freccia con Gradiente */}
                  {isOpen ? (
                    <FaChevronUp
                      size={20}
                      style={{
                        fill: `url(#gradient-${uniqueId})`, // Gradient animato
                        filter: "drop-shadow(0 0 4px rgba(255, 0, 128, 0.5))",
                        transition: "transform 0.3s ease",
                      }}
                    />
                  ) : (
                    <FaChevronDown
                      size={20}
                      style={{
                        fill: `url(#gradient-${uniqueId})`, // Gradient animato
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
          className="mt-4 PopoverContent rounded-lg shadow-lg"
          align="start" // Allinea il contenuto con il trigger
        >
          <div className="w-full h-full border-gradient p-[1px] rounded-lg animated-gradient">
            <div className="px-6 p-4 bg-background rounded-lg">
              <div className="space-y-2">
                {options.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedOption === option.value}
                      onCheckedChange={() => handleSelect(option.value)}
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-2"></div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SelectMenu;
