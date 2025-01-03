"use client";

import React from "react";

import { MenuProvider } from "@/context/MenuContext";
import { ThemeProvider } from "@/context/theme/ThemeProvider";

const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <MenuProvider>{children}</MenuProvider>
    </ThemeProvider>
  );
};

export default Providers;
