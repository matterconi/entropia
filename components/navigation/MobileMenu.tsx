"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import { FaSignOutAlt, FaUserPlus } from "react-icons/fa";

import ThemeSwitch from "@/components/navigation/ThemeSwitch";
import { useMenu } from "@/context/MenuContext";
import { useSystemTheme } from "@/hooks/useSystemTheme";

import { RainbowButton } from "../ui/rainbow-button";
import { SecondaryButton } from "../ui/secondary-button";

export default function MobileMenu() {
  const { isMenuOpen, toggleMenuVisibility } = useMenu(); // Use menu context
  const [isActive, setIsActive] = useState("");
  const [isAuth, setIsAuth] = useState(true);
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
      .replace(/\s+/g, "-") // Replace spaces with dashes
      .replace(/[^a-z0-9-]/g, ""); // Remove special characters
  };

  const links = ["Home", "Chi Siamo", "Categorie", "Generi", "Contatti"];

  return (
    <div className="max-w-screen">
      {/* Menu Icon */}
      <div
        className="border-gradient rounded-md p-[1px] animated-gradient lg:hidden"
        aria-label="Toggle mobile menu"
      >
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
            <div className="w-full flex h-[105px] items-center justify-between pt-8 pb-6 px-4 md:px-8 space-x-8">
              <div className="text-2xl font-bold text-gradient font-title sm:px-2">
                3NTR0P14
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
            {!isAuth ? (
              <div className="flex flex-col items-center md:flex-row max-md:space-y-6 max-md:w-full md:space-x-12 px-6 md:pb-12">
                <div className="border-gradient rounded-xl animated-gradient p-[1px] h-fit max-md:w-full max-md:max-w-[300px] md:w-[250px]">
                  <RainbowButton className="md:min-w-[200px]" icon="signIn">
                    Log in
                  </RainbowButton>
                </div>
                <div className="border-gradient rounded-xl animated-gradient p-[1px] max-md:w-full max-md:max-w-[300px] md:w-[250px]">
                  <div className="bg-background w-full h-full rounded-xl flex items-center justify-center">
                    <SecondaryButton
                      onClick={() => alert("Clicked!")}
                      className="font-sans text-lg"
                      isDarkMode={isDarkMode}
                    >
                      Sign up
                      <FaUserPlus className="h-5 w-5 text-foreground ml-1" />
                    </SecondaryButton>
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-6 md:pb-12 w-full flex items-center justify-center">
                <div className="border-gradient rounded-xl animated-gradient p-[1px] h-fit max-lg:w-full max-lg:max-w-[300px]">
                  <div className="bg-background w-full h-full rounded-xl flex items-center justify-center">
                    <SecondaryButton
                      icon="SignUp"
                      onClick={() => alert("Clicked!")}
                      className="font-sans text-lg"
                      isDarkMode={isDarkMode}
                    >
                      Sign out
                      <FaSignOutAlt className="h-5 w-5 text-foreground ml-1" />
                    </SecondaryButton>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
