"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";

import { MenuProvider } from "@/context/MenuContext";
import { SignModalProvider } from "@/context/SignModalContext";
import { ThemeProvider } from "@/context/theme/ThemeProvider";

import { FilterProvider } from "./FilterContext";
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
              <SignModalProvider>{children}</SignModalProvider>
            </FilterProvider>
          </UserProvider>
        </MenuProvider>
      </ThemeProvider>
    </SessionProvider>
  );
};

export default Providers;
