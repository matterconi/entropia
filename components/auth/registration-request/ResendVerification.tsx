"use client";

import React from "react";
import { IoReload } from "react-icons/io5";

import { ShinyButton } from "@/components/ui/shiny-button";

interface ResendVerificationProps {
  isResending: boolean;
  cooldown: number;
  handleResendEmail: () => Promise<void>;
}

export function ResendVerification({
  isResending,
  cooldown,
  handleResendEmail,
}: ResendVerificationProps) {
  const isDisabled = isResending || cooldown > 0;

  return (
    <div className="mt-8">
      <div className="text-center text-muted-foreground mb-2">
        Non hai ricevuto il codice?
      </div>
      <div
        onClick={isDisabled ? undefined : handleResendEmail}
        className={`w-full ${isDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        {isResending ? (
          <div className="flex items-center justify-center gap-2">
            <IoReload size={18} className="text-blue-500 animate-spin" />
            <span className="">Invio in corso...</span>
          </div>
        ) : isDisabled ? (
          <div className="h-full w-full bg-gray-400 p-[1px] animated-gradient rounded-lg">
            <ShinyButton
              className="w-full bg-background rounded-lg h-full py-3"
              disabled
            >
              <div className="flex items-center justify-center gap-2">
                <IoReload size={18} className="text-muted-foreground" />
                <p className="font-semibold text-muted-foreground">{`Riprova tra ${cooldown} s`}</p>
              </div>
            </ShinyButton>
          </div>
        ) : (
          <div className="h-full w-full border-gradient p-[1px] animated-gradient rounded-lg mt-4">
            <ShinyButton className="w-full bg-background rounded-lg h-full py-3">
              <div className="flex items-center justify-center gap-2">
                <IoReload size={18} />
                <p className="text-sm font-semibold">
                  Invia di nuovo il codice
                </p>
              </div>
            </ShinyButton>
          </div>
        )}
      </div>
    </div>
  );
}
