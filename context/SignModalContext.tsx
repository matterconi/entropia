"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, {
  createContext,
  ReactNode,
  use,
  useContext,
  useEffect,
  useState,
} from "react";
import { useMediaQuery } from "react-responsive";

type SignType = "signIn" | "signUp";

interface SignModalContextType {
  isOpen: boolean;
  signType: SignType | null;
  setSignType: React.Dispatch<React.SetStateAction<SignType | null>>;
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Custom logic: Check if the screen is large (1024px or more)
  const isLargeScreen = useMediaQuery({ query: "(min-width: 1024px)" });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflowY = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto"; // Ripristina lo scroll quando il componente si smonta
    };
  }, [isOpen]);

  // Controlla se nella query c'è "isverified" o "isRegistered" impostato a "true" e forza l'apertura del modal
  useEffect(() => {
    const isVerifiedQuery = searchParams.get("isverified");
    if (isVerifiedQuery === "true") {
      // Imposta il tipo di modal (qui presumiamo sia signUp, modifica se necessario)
      setSignType("signUp");
      setIsOpen(true);
    }
  }, [searchParams]);

  const openModal = (type: SignType) => {
    if (isLargeScreen) {
      // Per schermi grandi, apri il modal
      setSignType(type);
      setIsOpen(true);
    } else {
      // Per schermi piccoli, naviga verso la route dedicata
      router.push(`/${type}`);
    }
  };

  const closeModal = () => {
    // Rimuove il flag dal localStorage
    console.log("Removing isRegistered from localStorage");
    localStorage.removeItem("isRegistered");
    // Crea una copia dei parametri di query attuali
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    // Rimuove i parametri "isverified" e "isRegistered"
    nextSearchParams.delete("isverified");
    nextSearchParams.delete("isRegistered");
    // Aggiorna l'URL senza ricaricare la pagina
    router.replace(`${pathname}?${nextSearchParams.toString()}`);
    setIsOpen(false);
    setSignType(null);
  };

  return (
    <SignModalContext.Provider
      value={{ isOpen, signType, openModal, closeModal, setSignType }}
    >
      {children}
    </SignModalContext.Provider>
  );
};

export const useSignModal = () => {
  const context = useContext(SignModalContext);
  if (context === undefined) {
    throw new Error("useSignModal must be ufsed within a SignModalProvider");
  }
  return context;
};
