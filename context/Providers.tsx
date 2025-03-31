"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";

import { AuthProvider } from "@/context/AuthContext"; // Importa il nuovo context unificato
import { MenuProvider } from "@/context/MenuContext";
import { ThemeProvider } from "@/context/theme/ThemeProvider";

import { FilterProvider } from "./FilterContext";
import { FilterCountsProvider } from "./FilterCountsContext";
import { UserProvider } from "./UserContext";

const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <MenuProvider>
          <UserProvider>
            <FilterProvider>
              <FilterCountsProvider>
                <AuthProvider>{children}</AuthProvider>
              </FilterCountsProvider>
            </FilterProvider>
          </UserProvider>
        </MenuProvider>
      </ThemeProvider>
    </SessionProvider>
  );
};

export default Providers;
