"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import {
  FaSignInAlt,
  FaSignOutAlt,
  FaUserCircle,
  FaUserPlus,
} from "react-icons/fa";

import ThemeSwitch from "@/components/navigation/ThemeSwitch";
import { useMenu } from "@/context/MenuContext";
import { useUser } from "@/context/UserContext"; // 👈 Importiamo il contesto utente
import { useSystemTheme } from "@/hooks/useSystemTheme";

import { RainbowButton } from "../ui/rainbow-button";
import { SecondaryButton } from "../ui/secondary-button";
import { ShinyButton } from "../ui/shiny-button";

export default function MobileMenu() {
  const { isMenuOpen, toggleMenuVisibility } = useMenu(); // Usa il contesto per il menu
  const { user } = useUser(); // 👈 Recuperiamo l'utente dal context
  const [isActive, setIsActive] = useState("");
  const pathname = usePathname();
  const { theme } = useTheme();
  const isSystemDark = useSystemTheme();
  const isDarkMode = theme === "dark" || (theme === "system" && isSystemDark);

  useEffect(() => {
    setIsActive(pathname === "/" ? "home" : pathname.split("/")[1]);
  }, [pathname]);

  const formatRoute = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-") // Sostituisce gli spazi con trattini
      .replace(/[^a-z0-9-]/g, ""); // Rimuove caratteri speciali
  };

  const links = ["Home", "Chi Siamo", "Categorie", "Generi", "Contatti"];

  return (
    <div className="max-w-screen">
      {/* Menu Icon */}
      <div className="border-gradient rounded-md p-[1px] animated-gradient lg:hidden">
        <div
          className="flex h-[56px] w-[56px] cursor-pointer items-center justify-center rounded-md text-gray-800 shadow-md transition bg-background"
          onClick={toggleMenuVisibility}
        >
          {isMenuOpen ? (
            <X className="text-foreground" />
          ) : (
            <Menu className="text-foreground" />
          )}
        </div>
      </div>

      {/* Fullscreen Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute top-0 left-0 w-screen h-screen inset-0 pb-16 overflow-hidden z-[100] bg-background">
          <div className="flex flex-col h-full w-full items-center justify-between">
            {/* Header del menu mobile */}
            <div className="w-full flex h-[105px] items-center justify-between pt-8 pb-6 px-4 md:px-8 space-x-8">
              <div className="text-2xl font-bold text-gradient font-title sm:px-2">
                VERSIA
              </div>
              <div className="flex">
                <ThemeSwitch />
                <div className="border-gradient p-[1px] animated-gradient rounded-md ml-4 md:ml-8">
                  <div
                    className="p-1 flex h-[56px] w-[56px] cursor-pointer items-center justify-center rounded-md text-gray-800 shadow-md transition bg-background"
                    onClick={toggleMenuVisibility}
                  >
                    <X className="text-foreground" />
                  </div>
                </div>
              </div>
            </div>

            {/* Link di navigazione */}
            <div className="flex flex-col h-full items-center justify-center">
              <ul className="text-xl font-bold font-sans space-y-2 w-full">
                {links.map((link) => (
                  <li
                    className={
                      isActive === formatRoute(link)
                        ? "border-gradient p-[1px] animated-gradient rounded-lg"
                        : "w-full"
                    }
                    key={link}
                  >
                    <div className="w-full h-full bg-background rounded-lg p-2">
                      <Link
                        href={link === "Home" ? "/" : `/${formatRoute(link)}`}
                        onClick={toggleMenuVisibility}
                        className="bg-background w-full h-full"
                      >
                        <span
                          className={
                            isActive === formatRoute(link)
                              ? "text-gradient"
                              : "text-single-gradient text-single-gradient-hover text-center transition-colors bg-background"
                          }
                        >
                          {link}
                        </span>
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* **Se l'utente è autenticato** */}
            {user ? (
              <div className="px-6 md:pb-12 w-full flex flex-col items-center space-y-6">
                {/* Link al profilo */}
                <Link href={`/users/${user.id}`} onClick={toggleMenuVisibility}>
                  <div className="h-[56px] w-[250px] p-[1px] border-gradient rounded-lg animated-gradient">
                    <ShinyButton className="h-full w-full bg-background rounded-lg flex items-center justify-center">
                      <div className="flex items-center justify-center h-full w-full gap-3">
                        <p className="font-semibold text-gradient text-base animated-gradient">
                          Profile
                        </p>
                        <FaUserCircle className="h-5 w-5" />
                      </div>
                    </ShinyButton>
                  </div>
                </Link>

                <div
                  className="h-[56px] w-[250px] p-[1px] border-gradient rounded-lg animated-gradient"
                  onClick={() => {
                    signOut();
                    toggleMenuVisibility();
                  }}
                >
                  <RainbowButton
                    className="w-full h-full bg-background rounded-lg flex items-center justify-center gap-3"
                    icon="signOut"
                  >
                    <p className="font-semibold text-base">Sign-out</p>
                  </RainbowButton>
                </div>
              </div>
            ) : (
              /* **Se l'utente NON è autenticato** */
              <div className="flex flex-col items-center md:flex-row max-md:space-y-6 max-md:w-full md:space-x-12 px-6 md:pb-12">
                {/* Sign-In */}
                <Link href="/sign-in">
                  <div className="h-[56px] w-[250px] p-[1px] border-gradient rounded-lg animated-gradient">
                    <ShinyButton className="h-full w-full bg-background rounded-lg flex items-center justify-center">
                      <div className="flex items-center justify-center h-full w-full gap-3">
                        <p className="font-semibold text-gradient text-base animated-gradient">
                          Sign-in
                        </p>
                        <FaSignInAlt className="h-5 w-5" />
                      </div>
                    </ShinyButton>
                  </div>
                </Link>

                {/* Sign-Up */}
                <Link href="/sign-up">
                  <div className="h-[56px] w-[250px] p-[1px] border-gradient rounded-lg animated-gradient">
                    <RainbowButton
                      className="w-full h-full bg-background rounded-lg flex items-center justify-center gap-3"
                      icon="signUp"
                    >
                      <p className="font-semibold text-base">Sign-up</p>
                    </RainbowButton>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
