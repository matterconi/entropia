"use client";

import "./popOverStyles.css";

import React, { useId, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface SingleSelectMenuProps {
  label: string;
  options: { value: string; label: string }[];
  selectedOption: string; // ✅ Accetta una stringa singola
  onChange: (selected: string) => void; // ✅ Passa una stringa singola
}

const SingleSelectMenu: React.FC<SingleSelectMenuProps> = ({
  label,
  options,
  selectedOption,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const uniqueId = useId();

  return (
    <div className="relative w-full">
      <Popover onOpenChange={(open) => setIsOpen(open)}>
        {/* Trigger del Popover */}
        <PopoverTrigger asChild>
          <div className="w-full h-full border-gradient animated-gradient p-[1px] my-4 md:my-0 rounded-lg min-w-[300px]">
            <div className="w-full h-full bg-background rounded-lg">
              <button
                className="w-full rounded-lg px-4 py-2 flex justify-between items-center"
                type="button"
              >
                <h3 className="font-semibold text-sm">{label}</h3>
                <span className="text-sm">{selectedOption || "Seleziona..."}</span>
                <div className="flex items-center justify-center">
                  {isOpen ? (
                    <FaChevronUp size={20} />
                  ) : (
                    <FaChevronDown size={20} />
                  )}
                </div>
              </button>
            </div>
          </div>
        </PopoverTrigger>

        {/* Contenuto del Popover */}
        <PopoverContent className="my-4 PopoverContent rounded-lg shadow-lg" align="start">
          <div className="w-full h-full border-gradient p-[1px] rounded-lg animated-gradient">
            <div className="px-6 p-4 bg-background rounded-lg">
              <div className="space-y-2">
                {options.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      checked={selectedOption === option.value}
                      onChange={() => onChange(option.value)} // ✅ Passa direttamente la stringa selezionata
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SingleSelectMenu;
