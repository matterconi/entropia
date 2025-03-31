"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { IoCloseSharp } from "react-icons/io5";

import AuthForm from "@/components/auth/authform/AuthForm";
import RegistrationRequest from "@/components/auth/registration-request/RegistrationRequest";
import { ShinyButton } from "@/components/ui/shiny-button";
import { useAuth } from "@/context/AuthContext"; // Importa il nuovo hook unificato
import { useUser } from "@/context/UserContext";
import { SignUpSchema } from "@/validations/authSchema";

import { RainbowButton } from "../ui/rainbow-button";

export default function SignUpModal() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationData, setRegistrationData] = useState<{
    email: string | null;
    registrationToken: string | null;
  }>({ email: null, registrationToken: null });

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isOpen, closeModal, signType, setSignType } = useAuth(); // Utilizziamo il nuovo hook unificato
  const { user, loading } = useUser();

  // Assicuriamoci che il tipo sia impostato correttamente all'inizio
  useEffect(() => {
    if (isOpen && signType !== "signUp") {
      console.log("Setting sign type to signUp in SignUpModal");
      setSignType("signUp");
    }
  }, [isOpen, signType, setSignType]);

  // Funzione per gestire il cambio di stato della registrazione
  const handleSetIsRegistered = (value: boolean) => {
    console.log("Setting isRegistered to:", value);
    setIsRegistered(value);
    if (value) {
      localStorage.setItem("isRegistered", "true");
    }
  };

  // Handler per gestire i dati di registrazione
  const handleSetRegistrationData = (data: {
    email: string;
    registrationToken: string;
  }) => {
    console.log("Setting registration data:", data);
    setRegistrationData(data);
  };

  // Funzione per gestire il Google Sign-Up
  const handleGoogleSignUp = async () => {
    const result = await signIn("google", { pathname });
    if (!result?.error) {
      console.log("Google sign in riuscito, callbackUrl:", pathname);
      closeModal();
    } else {
      console.error("Errore nel Google sign in:", result.error);
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-background bg-opacity-50"
        onClick={closeModal}
      >
        <div
          className="relative max-sm:min-w-[300px] max-lg:min-w-[400px] lg:min-w-[450px]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full h-full border-gradient p-[1px] animated-gradient rounded-lg">
            <div className="mx-auto bg-background shadow-lg rounded-lg p-8 min-h-[400px]">
              <div className="flex items-center justify-between">
                {closeModal && (
                  <button onClick={closeModal}>
                    <IoCloseSharp className="h-6 w-6" />
                  </button>
                )}
              </div>
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (user && !isRegistered) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-background bg-opacity-50"
        onClick={closeModal}
      >
        <div
          className="relative max-sm:min-w-[300px] max-lg:min-w-[400px] lg:min-w-[450px]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full h-full border-gradient p-[1px] animated-gradient rounded-lg">
            <div className="mx-auto bg-background shadow-lg rounded-lg p-8 min-h-[400px] flex flex-col justify-center py-16">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Sei già autenticato</h2>
                {closeModal && (
                  <button onClick={closeModal}>
                    <IoCloseSharp className="h-6 w-6" />
                  </button>
                )}
              </div>
              <div className="flex flex-col h-full space-y-4 mt-8">
                <p>Non puoi registrarti perché hai già un account attivo.</p>
                <Link href="/" className="w-full flex justify-center ">
                  <RainbowButton className="w-fit">Vai alla Home</RainbowButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Debug: log prima del rendering
  console.log("Rendering SignUpModal with isRegistered =", isRegistered);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background bg-opacity-50"
      onClick={closeModal}
    >
      <div
        className="relative max-sm:min-w-[300px] max-lg:min-w-[400px] lg:min-w-[450px]"
        onClick={(e) => e.stopPropagation()}
      >
        {!isRegistered ? (
          <>
            {/* Sign-Up Form */}
            <AuthForm
              schema={SignUpSchema}
              defaultValues={{ email: "", "conferma email": "", password: "" }}
              formType="SIGN_UP"
              setIsRegistered={handleSetIsRegistered}
              setRegistrationData={handleSetRegistrationData}
              onClose={closeModal}
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
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  or
                </span>
                <hr className="flex-1 border-gray-300 dark:border-gray-600" />
              </div>
            </AuthForm>
          </>
        ) : (
          <RegistrationRequest
            isModal
            onClose={closeModal}
            email={registrationData.email || undefined}
            registrationToken={registrationData.registrationToken || undefined}
          />
        )}
      </div>
    </div>
  );
}
