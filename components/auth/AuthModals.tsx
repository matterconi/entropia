"use client";

import React from "react";

import SignInModal from "@/components/auth/SignInModal";
import SignUpModal from "@/components/auth/SignUpModal";
import { useAuth } from "@/context/AuthContext"; // Importa il nuovo hook unificato

export default function AuthModals() {
  // Ora utilizziamo useAuth invece di useSignModal
  const { isOpen, signType, closeModal } = useAuth();

  return (
    <>
      {isOpen && signType === "signIn" && (
        <SignInModal isOpen={isOpen} onClose={closeModal} />
      )}
      {isOpen && signType === "signUp" && <SignUpModal />}
    </>
  );
}
