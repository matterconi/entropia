"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";

import AuthForm from "@/components/auth/authform/AuthForm";
import RegistrationRequest from "@/components/auth/registration-request/RegistrationRequest";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { ShinyButton } from "@/components/ui/shiny-button";
import { useUser } from "@/context/UserContext";
import { SignUpSchema, SignUpSchemaType } from "@/validations/authSchema";

export default function SignUpPage() {
  // Controllo se l'utente è già autenticato
  const { user, loading } = useUser();

  // Stati locali per la gestione del flusso di registrazione
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationData, setRegistrationData] = useState<{
    email: string | null;
    registrationToken: string | null;
  }>({ email: null, registrationToken: null });

  const handleGoogleSignUp = async () => {
    await signIn("google", { callbackUrl: "/" }); // Redirect alla homepage dopo il login
  };

  // Handler per gestire lo stato di registrazione
  const handleSetIsRegistered = (value: React.SetStateAction<boolean>) => {
    const newValue = typeof value === "function" ? value(isRegistered) : value;
    console.log("Setting isRegistered to:", newValue);
    setIsRegistered(newValue);
  };

  // Handler per gestire i dati di registrazione
  const handleSetRegistrationData = (data: {
    email: string;
    registrationToken: string;
  }) => {
    console.log("Setting registration data:", data);
    setRegistrationData({
      email: data.email,
      registrationToken: data.registrationToken,
    });
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
            schema={SignUpSchema} // Aggiungi lo schema qui
            defaultValues={{ email: "", "conferma email": "", password: "" }}
            formType="SIGN_UP"
            setIsRegistered={handleSetIsRegistered}
            setRegistrationData={handleSetRegistrationData}
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
        <RegistrationRequest
          email={registrationData.email || undefined}
          registrationToken={registrationData.registrationToken || undefined}
        />
      )}
    </div>
  );
}
