"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import { FaBars } from "react-icons/fa"; // Importing Hamburger Icon

import LocalSearch from "@/components/shared/LocalSearch";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";

import ThemeSwitch from "./ThemeSwitch";

export default function Navbar() {
  const { theme, setTheme } = useTheme();

  const pathname = usePathname();

  return (
    <nav className="relative top-0 flex h-[105px] items-center justify-between space-x-16 bg-white px-12 py-6 shadow-md dark:bg-black">
      {/* Left Section: Brand Name */}
      <div className="text-lg font-bold text-black dark:text-white">
        Entropia
      </div>

      {/* Center Section: LocalSearch */}
      <div className="mx-8 flex-grow">
        <LocalSearch
          route={pathname}
          imgSrc="/icons/search.svg"
          placeholder="Cerca nel sito..."
          otherClasses="w-full"
        />
      </div>

      {/* Right Section: Navigation Links and Theme Toggle */}
      <div className="flex items-center space-x-8">
        <Menubar className="hidden min-h-[56px] items-center gap-4 rounded-md bg-gradient-to-r from-gray-900 to-black px-4 py-2 text-white shadow-md lg:flex">
          <MenubarMenu>
            <MenubarTrigger className="text-white transition duration-200 hover:text-cyan-400">
              Chi Siamo
            </MenubarTrigger>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger className="text-white transition duration-200 hover:text-cyan-400">
              Categorie
            </MenubarTrigger>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger className="text-white transition duration-200 hover:text-cyan-400">
              Contatti
            </MenubarTrigger>
          </MenubarMenu>
        </Menubar>

        <ThemeSwitch />
      </div>
    </nav>
  );
}
