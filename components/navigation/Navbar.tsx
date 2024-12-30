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
    <nav className="relative top-0 flex h-[105px] items-center justify-between space-x-16 px-12 py-6 ">
      {/* Left Section: Brand Name */}
      <div className="text-2xl font-bold text-gradient font-title">
        3NTR0P14
      </div>

      {/* Center Section: LocalSearch */}
      <div className="mx-8 flex-grow border-gradient p-[1px] rounded-md animated-gradient max-md:hidden">
        <LocalSearch
          route={pathname}
          imgSrc="/icons/search.svg"
          placeholder="Cerca nel sito..."
          otherClasses="w-full"
        />
      </div>

      {/* Right Section: Navigation Links and Theme Toggle */}
      <div className="flex items-center space-x-8">
        <div className="hidden lg:flex border-gradient rounded-md p-[1px] animated-gradient">
          <Menubar className="hidden min-h-[56px] items-center gap-4 shadow-md lg:flex">
            <MenubarMenu>
              <MenubarTrigger className="font-typo-menu">
                Chi Siamo
              </MenubarTrigger>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger className="font-typo-menu">
                Categorie
              </MenubarTrigger>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger className="font-typo-menu">
                Contatti
              </MenubarTrigger>
            </MenubarMenu>
          </Menubar>
        </div>

        <ThemeSwitch />
      </div>
    </nav>
  );
}
