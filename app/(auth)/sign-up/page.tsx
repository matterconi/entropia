"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";

import AuthForm from "@/components/auth/AuthForm";
import RegistrationSuccess from "@/components/auth/RegistrationSuccess";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { ShinyButton } from "@/components/ui/shiny-button";
import { useUser } from "@/context/UserContext"; // Assicurati di usare il percorso corretto
import { SignUpSchema, SignUpSchemaType } from "@/validations/authSchema";

export default function SignUpPage() {
  // Controllo se l'utente è già autenticato
  const { user, loading } = useUser();

  // Stato persistente in localStorage per gestire la registrazione
  const [isRegistered, setIsRegistered] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("isRegistered") === "true";
    }
    return false;
  });

  // Al mount, aggiorna lo stato in base a localStorage
  useEffect(() => {
    const storedRegistered = localStorage.getItem("isRegistered");
    if (storedRegistered === "true") {
      setIsRegistered(true);
    }
  }, []);

  const handleGoogleSignUp = async () => {
    await signIn("google", { callbackUrl: "/" }); // Redirect alla homepage dopo il login
  };

  // Se il caricamento è in corso, mostra un messaggio di caricamento
  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }

  // Se l'utente è già autenticato, mostra un'interfaccia alternativa
  if (user && !isRegistered) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <h2 className="text-2xl font-bold">Sei già autenticato</h2>
        <p>Non puoi registrarti perché hai già un account attivo.</p>
        <Link href="/">
          <RainbowButton className="w-fit !mt-8">Vai alla Home</RainbowButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-sm:min-w-[300px] max-lg:min-w-[400px] lg:min-w-[450px] mx-auto space-y-4">
      {!isRegistered ? (
        <>
          {/* Form di registrazione */}
          <AuthForm<SignUpSchemaType>
            schema={SignUpSchema}
            defaultValues={{ username: "", email: "", password: "" }}
            formType="SIGN_UP"
            setIsRegistered={setIsRegistered}
          >
            {/* Pulsante per il Sign-Up con Google */}
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
              <span className="text-sm text-gray-500 dark:text-gray-400">
                or
              </span>
              <hr className="flex-1 border-gray-300 dark:border-gray-600" />
            </div>
          </AuthForm>
        </>
      ) : (
        <RegistrationSuccess />
      )}
    </div>
  );
}
