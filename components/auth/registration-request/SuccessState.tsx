// File: SuccessState.tsx
"use client";

import Link from "next/link";
import React, { useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";

import { RainbowButton } from "@/components/ui/rainbow-button";

import { RegistrationProps } from "./types";

export function SuccessState({ isModal, onClose }: RegistrationProps) {
  // Redirect automatico dopo alcuni secondi
  useEffect(() => {
    if (!isModal) {
      const timer = setTimeout(() => {
        window.location.href = "/";
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isModal]);

  return (
    <div className="border-gradient p-[1px] rounded-lg w-full max-w-2xl flex flex-col items-center justify-center z-10">
      <div className="z-10 w-full h-auto py-16 bg-background rounded-lg px-4 max-md:px-8">
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 flex items-center justify-center mb-8">
            <div className="absolute inset-0 bg-green-500 opacity-20 rounded-full animate-pulse"></div>
            <FaCheckCircle className="text-6xl text-green-500" />
          </div>

          <h2 className="text-4xl font-title text-foreground text-center mb-4">
            Benvenuto in <span className="text-gradient">Versia</span>
          </h2>

          <p className="text-center text-muted-foreground max-w-lg mb-8">
            La tua email è stata verificata con successo! Sei pronto per
            iniziare.
          </p>

          {isModal ? (
            <div onClick={onClose} className="mt-8 cursor-pointer">
              <RainbowButton className="w-fit p-4 px-6">
                <p className="font-semibold text-gradient">
                  Inizia l&apos;esperienza
                </p>
              </RainbowButton>
            </div>
          ) : (
            <Link href="/" className="mt-8">
              <RainbowButton className="w-fit p-4 px-6">
                <p className="font-semibold text-gradient">
                  Inizia l&apos;esperienza
                </p>
              </RainbowButton>
            </Link>
          )}

          <p className="text-sm text-muted-foreground mt-4">
            {!isModal
              ? "Sarai reindirizzato automaticamente tra pochi secondi..."
              : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
