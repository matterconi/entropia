"use client";

import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import { useFilterContext } from "@/context/FilterContext";

import DeskFilterMenu from "./DeskFilterMenu";
import FilterSlider from "./FilterSlider";
import MenuButton from "./MenuButton";

const Filters = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { clearFilters } = useFilterContext();
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState("");

  const handleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    console.log("🔄 Effetto per il pathname...", pathname, prevPathname);
    if (prevPathname !== pathname) {
      console.log("🔄 Pathname cambiato, resetto i filtri...");
      clearFilters();
      setPrevPathname(pathname); // Aggiorna il prevPathname con il pathname corrente
    }
  }, [pathname, clearFilters, prevPathname]);

  return (
    <div className="w-screen">
      <div className="flex items-center justify-center max-md:px-4 px-12 py-4 overflow-hidden">
        <FilterSlider />
        <MenuButton
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          handleOpen={handleOpen}
        />
      </div>
      {isOpen && (
        <div className="max-lg:hidden">
          <DeskFilterMenu />
        </div>
      )}
    </div>
  );
};

export default Filters;
