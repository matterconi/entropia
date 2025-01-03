"use client";

import React, { createContext, ReactNode, useContext, useState } from "react";

// Create the context
const MenuContext = createContext<{
  isMenuOpen: boolean;
  toggleMenuVisibility: () => void;
} | null>(null); // Initialize with null for safety

// Create a provider for the context
export const MenuProvider = ({ children }: { children: ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenuVisibility = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <MenuContext.Provider value={{ isMenuOpen, toggleMenuVisibility }}>
      {children}
    </MenuContext.Provider>
  );
};

// Hook to use the context
export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
};
