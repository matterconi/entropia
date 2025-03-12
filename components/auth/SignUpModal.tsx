"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";

import AuthForm from "@/components/auth/AuthForm";
import RegistrationSuccess from "@/components/auth/RegistrationSuccess";
import { ShinyButton } from "@/components/ui/shiny-button";
import { useSignModal } from "@/context/SignModalContext";
import { useUser } from "@/context/UserContext"; // Assicurati di usare il percorso corretto
import { SignUpSchema } from "@/validations/authSchema";
import Link from "next/link";
import { RainbowButton } from "../ui/rainbow-button";
import { IoCloseSharp } from "react-icons/io5";

export default function SignUpModal() {
  const [isRegistered, setIsRegistered] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isOpen, closeModal } = useSignModal();
  const { user, loading } = useUser();

  // Blocca lo scroll quando il modal è aperto

  useEffect(() => {
    const storedRegistered = localStorage.getItem("isRegistered");
    if (storedRegistered === "true") {
      setIsRegistered(true);
    }
  }, []);

  // Aggiorna localStorage se la query string contiene "registered=true"
  useEffect(() => {
    if (searchParams.get("isverified") === "true") {
      localStorage.setItem("isRegistered", "true");
      setIsRegistered(true);
    }
  }, [searchParams]);


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

  if(!isOpen) return null;

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
              <RainbowButton className="w-fit">
                Vai alla Home
              </RainbowButton>
            </Link>
          </div>
        </div>
        </div>
      </div>
    </div>
    );
  }

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
              defaultValues={{ username: "", email: "", password: "" }}
              formType="SIGN_UP"
              setIsRegistered={setIsRegistered}
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
          <RegistrationSuccess isModal onClose={closeModal} />
        )}
      </div>
    </div>
  );
}
