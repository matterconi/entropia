"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import React from "react";
import { FaSignInAlt, FaUserPlus } from "react-icons/fa";

import Menu from "@/components/navigation/Menu";
import LocalSearch from "@/components/shared/LocalSearch";
import { useMenu } from "@/context/MenuContext"; // Import the useMenu hook
import { useSystemTheme } from "@/hooks/useSystemTheme";

import MobileMenu from "./MobileMenu";
import { RainbowButton } from "../ui/rainbow-button";
import { SecondaryButton } from "../ui/secondary-button";
import ThemeSwitch from "./ThemeSwitch";

export default function Navbar() {
  const { theme } = useTheme();
  const pathname = usePathname();
  const { isMenuOpen } = useMenu(); // Access isMenuOpen from the context
  const isSystemDark = useSystemTheme();
  const isDarkMode = theme === "dark" || (theme === "system" && isSystemDark);

  return (
    <nav
      className={`relative top-0 flex h-[105px] items-center justify-between ${
        isMenuOpen
          ? ""
          : "pt-8 pb-6 mx-4 md:mx-8 lg:mx-6 space-x-8 lg:space-x-4 xl:space-x-8"
      }`}
    >
      {/* Left Section: Brand Name */}
      <div className="text-2xl font-bold text-gradient font-title sm:px-2">
        3NTR0P14
      </div>

      <div className="hidden max-xl:w-[400px] w-[600px] lg:flex border-gradient p-[1px] rounded-md animated-gradient h-[56px]">
        <Menu />
      </div>

      {/* Right Section: Navigation Menu and Theme Toggle */}
      <div className="flex items-center justify-end h-[56px] lg:space-x-4 xl:space-x-8">
        <div className="max-lg:hidden flex space-x-4 items-center mx-4">
          {/* Log In Icon */}
          <div className="border-gradient rounded-xl animated-gradient p-[1px] h-fit lg:max-w-[56px] xl:min-w-[150px] xl:max-w-[200px]">
            <RainbowButton
              className="h-[56px] lg:max-w-[56px] xl:min-w-[150px] xl:max-w-[200px]"
              icon="signIn"
            >
              <p className="hidden xl:block">Log In</p>
            </RainbowButton>
          </div>
          {/* Sign Up Icon */}
          <div className="border-gradient rounded-xl animated-gradient p-[1px] lg:max-w-[56px] xl:min-w-[150px] xl:max-w-[200px]">
            <div className="bg-background w-full rounded-xl flex items-center justify-center h-[56px]">
              <SecondaryButton
                onClick={() => alert("Clicked!")}
                className="font-sans text-lg"
                isDarkMode={isDarkMode}
              >
                <p className="hidden xl:block">Sign Ip</p>
                <FaUserPlus className="h-5 w-5 text-foreground ml-1" />
              </SecondaryButton>
            </div>
          </div>
        </div>
        {/* Theme Toggle */}
        <ThemeSwitch />
        <div className="lg:hidden ml-4 md:ml-8">
          <MobileMenu />
        </div>
      </div>
    </nav>
  );
}
