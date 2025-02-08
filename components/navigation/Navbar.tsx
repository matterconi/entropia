"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import React from "react";
import {
  FaSignInAlt,
  FaSignOutAlt,
  FaUserCircle,
  FaUserPlus,
} from "react-icons/fa";

import { useMenu } from "@/context/MenuContext";
import { useSignModal } from "@/context/SignModalContext";
import { useUser } from "@/context/UserContext";
import { useSystemTheme } from "@/hooks/useSystemTheme";

import { ShinyButton } from "../ui/shiny-button";
import Menu from "./Menu";
import MobileMenu from "./MobileMenu";
import ThemeSwitch from "./ThemeSwitch";
import { RainbowButton } from "../ui/rainbow-button";

export default function Navbar() {
  const { theme } = useTheme();
  const pathname = usePathname();
  const { isMenuOpen } = useMenu();
  const { user } = useUser(); // Prendiamo i dati dell'utente dal context
  const isSystemDark = useSystemTheme();
  const isDarkMode = theme === "dark" || (theme === "system" && isSystemDark);

  const { openModal } = useSignModal(); // Modale per SignIn / SignUp

  return (
    <>
      <nav
        className={`relative top-0 flex h-[105px] items-center justify-between z-50 ${
          isMenuOpen
            ? ""
            : "pt-8 pb-6 mx-4 md:mx-8 lg:mx-6 space-x-8 lg:space-x-4 xl:space-x-8"
        }`}
      >
        {/* Sezione sinistra: Logo */}
        <div className="sm:px-2 flex items-center space-x-2">
          <Link href="/">
            <h1 className="text-2xl font-bold text-gradient font-title">
              VERSIA
            </h1>
          </Link>
        </div>

        {/* Menu Desktop */}
        <div className="hidden max-xl:w-[400px] w-[600px] lg:flex border-gradient p-[1px] rounded-md animated-gradient h-[56px]">
          <Menu />
        </div>

        {/* Sezione destra: Menu di navigazione e autenticazione */}
        <div className="flex items-center justify-end h-[56px] lg:space-x-4 space-x-6 xl:space-x-8">
          {/* Se l'utente è autenticato ➝ Mostra il profilo e il logout */}
          {user ? (
            <div className="lg:flex h-[58px] gap-4 justify-end max-lg:hidden">
              <Link href={`/users/${user.id}`}>
                <div className="h-full w-[56px] p-[1px] border-gradient rounded-lg animated-gradient xl:w-[175px]">
                  <ShinyButton className="h-full w-full bg-background rounded-lg flex items-center justify-center">
                    <div className="flex items-center justify-center h-full w-full gap-3">
                      <p className="font-semibold text-gradient text-base animated-gradient hidden xl:block">
                        Profile
                      </p>
                      <FaUserCircle className="h-5 w-5" />
                    </div>
                  </ShinyButton>
                </div>
              </Link>

              <div
                className="h-full w-[56px] p-[1px] border-gradient rounded-lg animated-gradient xl:w-[175px]"
                onClick={() => signOut()}
              >
                <RainbowButton
                  className="w-full h-full bg-background rounded-lg flex items-center justify-center gap-3"
                  icon="signOut"
                >
                  <p className="font-semibold text-base hidden xl:block">
                    Sign-out
                  </p>
                </RainbowButton>
              </div>
            </div>
          ) : (
            // Se l'utente NON è autenticato ➝ Mostra Sign-In / Sign-Up
            <div className="lg:flex h-[58px] gap-4 justify-end max-lg:hidden">
              <div className="h-full w-[56px] p-[1px] border-gradient rounded-lg animated-gradient xl:w-[175px]">
                <ShinyButton
                  className="h-full w-full bg-background rounded-lg flex items-center justify-center"
                  onClick={() => openModal("signIn")}
                >
                  <div className="flex items-center justify-center h-full w-full gap-3">
                    <p className="font-semibold text-gradient text-base animated-gradient hidden xl:block">
                      Sign-in
                    </p>
                    <FaSignInAlt className="h-5 w-5" />
                  </div>
                </ShinyButton>
              </div>

              <div className="h-full w-[56px] p-[1px] border-gradient rounded-lg animated-gradient xl:w-[175px]">
                <RainbowButton
                  className="w-full h-full bg-background rounded-lg flex items-center justify-center gap-3"
                  onClick={() => openModal("signUp")}
                  icon="signUp"
                >
                  <p className="font-semibold text-base hidden xl:block">
                    Sign-up
                  </p>
                </RainbowButton>
              </div>
            </div>
          )}

          {/* Toggle tema */}
          <ThemeSwitch />
          <div className="lg:hidden ml-4 md:ml-8">
            <MobileMenu />
          </div>
        </div>
      </nav>
    </>
  );
}
