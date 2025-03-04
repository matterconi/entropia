"use client";

import React from "react";

import SignInModal from "@/components/auth/SignInModal";
import SignUpModal from "@/components/auth/SignUpModal";
import { useSignModal } from "@/context/SignModalContext";

export default function AuthModals() {
  const { isOpen, signType, closeModal } = useSignModal();

  return (
    <>
      {isOpen && signType === "signIn" && (
        <SignInModal isOpen={isOpen} onClose={closeModal} />
      )}
      {isOpen && signType === "signUp" && <SignUpModal />}
    </>
  );
}
