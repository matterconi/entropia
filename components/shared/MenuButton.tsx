"use client";

import React, { useEffect, useState } from "react";
import { FiSliders } from "react-icons/fi";
import { IoClose } from "react-icons/io5";

import DeskFilterMenu from "./DeskFilterMenu";
import MobileFilterMenu from "./MobileFilterMenu";

const MenuButton = ({ isOpen, setIsOpen, handleOpen }) => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 1024px)").matches
      : false,
  );

  // Aggiorna isMobile quando cambia la dimensione dello schermo
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.matchMedia("(max-width: 1024px)").matches);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Controllo iniziale per evitare delay

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Caso 1: Menu è CHIUSO → Mostra il pulsante per aprirlo
  if (!isOpen) {
    return (
      <button
        className="flex items-center justify-center w-fit h-10 bg-gray-200 hover:bg-gray-300 rounded-full px-4"
        onClick={handleOpen}
      >
        <FiSliders className="text-xl text-gray-700" />
      </button>
    );
  }

  // Caso 2: Menu APERTO in MOBILE → Mostra MobileFilterMenu con overlay
  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-gray-300 bg-opacity-70 z-50 flex items-center justify-center">
        <MobileFilterMenu onClose={handleOpen} isOpen={isOpen} />
      </div>
    );
  }

  // Caso 3: Menu APERTO in DESKTOP → Mostra l'icona di chiusura
  return (
    <div className="flex justify-end">
      <button
        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
        onClick={handleOpen}
      >
        <IoClose className="text-xl text-gray-700" />
      </button>
    </div>
  );
};

export default MenuButton;
