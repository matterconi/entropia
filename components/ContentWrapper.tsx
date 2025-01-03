"use client";

import React from "react";

import { useMenu } from "@/context/MenuContext";

const ContentWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isMenuOpen } = useMenu(); // Access the menu state

  return (
    <div className={isMenuOpen ? "hidden" : "block"}>
      {/* Render the children only if the menu is not open */}
      {children}
    </div>
  );
};

export default ContentWrapper;
