"use client";

import { useRouter } from "next/navigation"; // for Next.js navigation
import React, { createContext, ReactNode, useContext, useState } from "react";
import { useMediaQuery } from "react-responsive";

type SignType = "signIn" | "signUp";

interface SignModalContextType {
  isOpen: boolean;
  signType: SignType | null;
  openModal: (type: SignType) => void;
  closeModal: () => void;
}

const SignModalContext = createContext<SignModalContextType | undefined>(
  undefined,
);

export const SignModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [signType, setSignType] = useState<SignType | null>(null);
  const router = useRouter();

  // Custom logic: Check if the screen is large (1024px or more)
  const isLargeScreen = useMediaQuery({ query: "(min-width: 1024px)" });

  const openModal = (type: SignType) => {
    if (isLargeScreen) {
      // For large screens, open the modal
      setSignType(type);
      setIsOpen(true);
    } else {
      // For smaller screens, navigate to the dedicated route
      router.push(`/${type}`);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setSignType(null);
  };

  return (
    <SignModalContext.Provider
      value={{ isOpen, signType, openModal, closeModal }}
    >
      {children}
    </SignModalContext.Provider>
  );
};

export const useSignModal = () => {
  const context = useContext(SignModalContext);
  if (context === undefined) {
    throw new Error("useSignModal must be used within a SignModalProvider");
  }
  return context;
};
