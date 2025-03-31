"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";

import AuthForm from "@/components/auth/authform/AuthForm";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { ShinyButton } from "@/components/ui/shiny-button";
import { useUser } from "@/context/UserContext"; // Assicurati di avere il percorso corretto
import {
  ForgotPasswordSchema,
  ForgotPasswordSchemaType,
  SignInSchema,
} from "@/validations/authSchema";

export default function SignInPage() {
  const { user, loading } = useUser();
  const [isResetting, setIsResetting] = useState(false);

  // Se lo stato di caricamento è attivo, mostra un messaggio di loading
  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }

  // Se l'utente è già autenticato, mostra l'interfaccia alternativa
  if (user) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <h2 className="text-2xl font-bold">Sei già autenticato</h2>
        <p>Non puoi effettuare il login perché hai già un account attivo.</p>
        <Link href="/">
          <RainbowButton className="w-fit !mt-8">Vai alla Home</RainbowButton>
        </Link>
      </div>
    );
  }

  // Funzione per gestire il login con Google
  const handleGoogleSignIn = async () => {
    await signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="max-sm:min-w-[300px] max-lg:min-w-[400px] lg:min-w-[450px] mx-auto space-y-4">
      {/* Form di login */}
      {!isResetting ? (
        <AuthForm
          schema={SignInSchema}
          defaultValues={{ email: "", password: "" }}
          formType="SIGN_IN"
          setIsResetting={setIsResetting}
        >
          {/* Pulsante per il login con Google */}
          <div className="border-gradient p-[1px] animated-gradient rounded-lg mb-8 mt-10">
            <ShinyButton
              onClick={handleGoogleSignIn}
              className="w-full bg-background rounded-lg min-h-[56px] h-full"
            >
              <div className="min-h-[56px] h-full flex items-center justify-center gap-2">
                <FcGoogle size={20} />
                <span className="text-gray-700 dark:text-gray-300 text-base">
                  Sign in with Google
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
      ) : (
        <AuthForm<ForgotPasswordSchemaType>
          schema={ForgotPasswordSchema}
          defaultValues={{ email: "" }}
          formType="RESET_PASS"
          setIsResetting={setIsResetting}
        >
          <div className="border-gradient p-[1px] animated-gradient rounded-lg mb-8 mt-6">
            <ShinyButton
              onClick={handleGoogleSignIn}
              className="w-full bg-background rounded-lg min-h-[56px] h-full"
            >
              <div className="min-h-[56px] h-full flex items-center justify-center gap-2">
                <FcGoogle size={20} />
                <span className="text-gray-700 dark:text-gray-300 text-base">
                  Sign in with Google
                </span>
              </div>
            </ShinyButton>
          </div>

          <div className="flex items-center gap-2">
            <hr className="flex-1 border-gray-300 dark:border-gray-600" />
            <span className="text-sm text-gray-500 dark:text-gray-400">o</span>
            <hr className="flex-1 border-gray-300 dark:border-gray-600" />
          </div>
        </AuthForm>
      )}
    </div>
  );
}
