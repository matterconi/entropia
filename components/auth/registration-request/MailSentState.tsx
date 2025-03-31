"use client";

import Link from "next/link";
import React from "react";
import { IoCloseSharp } from "react-icons/io5";
import { MdMarkEmailRead } from "react-icons/md";

import { ShinyButton } from "@/components/ui/shiny-button";

import { RegistrationProps } from "./types";

export function SuccessState({ isModal, onClose }: RegistrationProps) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200 max-w-md">
        {isModal && (
          <IoCloseSharp
            onClick={onClose}
            className="text-foreground cursor-pointer size-8"
          />
        )}
        {!isModal && (
          <Link href="/" className="block w-full">
            <IoCloseSharp className="text-foreground cursor-pointer size-8" />
          </Link>
        )}
        {/* Icona Animata */}
        <div className="flex items-center justify-center w-20 h-20 mx-auto bg-green-100 text-green-600 rounded-full shadow-lg mb-4">
          <MdMarkEmailRead size={50} />
        </div>

        <h2 className="text-3xl font-bold text-gradient font-title mb-4 text-center">
          Registrazione completata!
        </h2>
        <p className="text-gray-700 mt-2 text-center">
          Il tuo account è stato verificato con successo.
        </p>

        {/* Pulsante per continuare */}
        <div className="mt-8">
          {isModal ? (
            <div className="h-full w-full border-gradient p-[1px] animated-gradient rounded-lg">
              <ShinyButton
                className="w-full bg-background rounded-lg h-full py-3"
                onClick={onClose}
              >
                <p className="font-semibold">Continua</p>
              </ShinyButton>
            </div>
          ) : (
            <Link href="/" className="block w-full">
              <div className="h-full w-full border-gradient p-[1px] animated-gradient rounded-lg">
                <ShinyButton className="w-full bg-background rounded-lg h-full py-3">
                  <p className="font-semibold">Vai alla Home</p>
                </ShinyButton>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
