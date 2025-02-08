"use client";

import { signIn } from "next-auth/react";
import React, { useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { IoCloseSharp } from "react-icons/io5";

import AuthForm from "@/components/auth/AuthForm";
import { ShinyButton } from "@/components/ui/shiny-button";
import { SignUpSchema } from "@/validations/authSchema";

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignUpModal({ isOpen, onClose }: SignUpModalProps) {
  // Se il modal non deve essere visualizzato, non renderizziamo nulla
  // Blocca lo scroll quando il modal è aperto
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Funzione per gestire il Google Sign-Up
  const handleGoogleSignUp = async () => {
    const result = await signIn("google", { callbackUrl: "/" });
    if (!result?.error) {
      onClose();
    }
  };

  // Funzione per gestire il Sign-Up manuale
  const handleSignUp = async (data: any) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Sign-up failed:", errorData);
        return;
      }

      console.log("Sign-up successful!");
      onClose();
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  return (
    // Overlay: cliccando fuori dal contenitore chiudiamo il modal
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      {/* Container del modal */}
      <div
        className="relative bg-white p-6 rounded-lg shadow-lg max-sm:min-w-[300px] max-lg:min-w-[400px] lg:min-w-[450px] mx-auto space-y-4"
        onClick={(e) => e.stopPropagation()} // Previene la chiusura se si clicca all'interno
      >
        {/* Icona per chiudere il modal */}
        <button onClick={onClose} className="absolute top-4 right-4">
          <IoCloseSharp className="h-6 w-6" />
        </button>

        {/* Sign-Up Form */}
        <AuthForm
          schema={SignUpSchema}
          defaultValues={{ username: "", email: "", password: "" }}
          formType="SIGN_UP"
          onSubmitAction={handleSignUp}
        >
          {/* Google Sign-Up Button */}
          <div className="border-gradient p-[1px] animated-gradient rounded-lg mb-8 mt-10">
            <ShinyButton
              onClick={handleGoogleSignUp}
              className="w-full bg-background rounded-lg min-h-[56px] h-full"
            >
              <div className="min-h-[56px] h-full flex items-center justify-center gap-2">
                <FcGoogle size={20} />
                <span className="text-gray-700 dark:text-gray-300 text-base">
                  Sign up with Google
                </span>
              </div>
            </ShinyButton>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-2">
            <hr className="flex-1 border-gray-300 dark:border-gray-600" />
            <span className="text-sm text-gray-500 dark:text-gray-400">or</span>
            <hr className="flex-1 border-gray-300 dark:border-gray-600" />
          </div>
        </AuthForm>
      </div>
    </div>
  );
}
