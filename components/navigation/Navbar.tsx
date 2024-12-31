"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import React from "react";

import Menu from "@/components/navigation/Menu";
import LocalSearch from "@/components/shared/LocalSearch";

import ThemeSwitch from "./ThemeSwitch";

export default function Navbar() {
  const { theme } = useTheme();
  const pathname = usePathname();

  return (
    <nav className="relative top-0 flex h-[105px] items-center justify-between pt-8 pb-6 mx-6 md:mx-8 space-x-8">
      {/* Left Section: Brand Name */}
      <div className="text-2xl font-bold text-gradient font-title px-2">
        3NTR0P14
      </div>

      {/* Center Section: LocalSearch */}
      <div className="hidden flex-grow border-gradient p-[1px] rounded-md animated-gradient xl:flex">
        <LocalSearch
          route={pathname}
          imgSrc="/icons/search.svg"
          placeholder="Cerca nel sito..."
          otherClasses="w-full"
        />
      </div>

      {/* Right Section: Navigation Menu and Theme Toggle */}
      <div className="flex items-center h-[56px] justify-end lg:space-x-8">
        {/* Navigation Menu */}
        <div className="hidden w-[600px] lg:flex border-gradient p-[1px] rounded-md animated-gradient h-full">
          <Menu />
        </div>
        {/* Theme Toggle */}
        <ThemeSwitch />
      </div>
    </nav>
  );
}
