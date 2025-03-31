"use client";

import React from "react";
import { IoReload } from "react-icons/io5";

import { RainbowButton } from "@/components/ui/rainbow-button";

interface VerifyButtonProps {
  onClick: () => void;
  isVerifying: boolean;
}

export function VerifyButton({ onClick, isVerifying }: VerifyButtonProps) {
  return (
    <RainbowButton
      className="w-full bg-background rounded-lg h-full py-3"
      onClick={onClick}
      disabled={isVerifying}
    >
      {isVerifying ? (
        <div className="flex items-center justify-center gap-2">
          <IoReload size={18} className="animate-spin" />
          <p className="font-semibold">Verifica in corso...</p>
        </div>
      ) : (
        <p className="font-semibold">Verifica codice</p>
      )}
    </RainbowButton>
  );
}
