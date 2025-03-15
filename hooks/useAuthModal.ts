// hooks/useAuthModal.ts
"use client";

import { useState } from "react";

import { useUser } from "@/context/UserContext";
import { User } from "@/types";

/**
 * Hook personalizzato per gestire il modale di autenticazione/verifica utente
 * @returns Oggetto con lo stato del modale e funzioni per gestirlo
 */
export const useAuthModal = () => {
  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * Controlla se l'utente può eseguire un'azione
   * Se l'utente non è autenticato o non è verificato, apre il modale
   * @returns true se l'utente può eseguire l'azione, false altrimenti
   */
  const checkUserCanPerformAction = (): boolean => {
    if (!user || !user.isVerified) {
      setIsModalOpen(true);
      return false;
    }
    return true;
  };

  /**
   * Chiude il modale
   */
  const closeModal = () => {
    setIsModalOpen(false);
  };

  return {
    isModalOpen,
    closeModal,
    checkUserCanPerformAction,
    setIsModalOpen,
    isUserLoggedIn: !!user,
    isUserVerified: user?.isVerified || false,
    user: user as User | null,
  };
};

export default useAuthModal;
