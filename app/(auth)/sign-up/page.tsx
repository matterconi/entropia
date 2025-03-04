"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";

import AuthForm from "@/components/auth/AuthForm";
import RegistrationSuccess from "@/components/auth/RegistrationSuccess";
import { ShinyButton } from "@/components/ui/shiny-button";
import { SignUpSchema, SignUpSchemaType } from "@/validations/authSchema";

export default function SignUpPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Stato persistente in localStorage
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

  // Aggiorna localStorage se la query string contiene "registered=true"
  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      localStorage.setItem("isRegistered", "true");
      setIsRegistered(true);
    }
  }, [searchParams]);

  // Non usiamo qui l'effetto per pulire il localStorage: questo verrà gestito in onClose

  // Funzione per gestire il Google Sign-Up
  const handleGoogleSignUp = async () => {
    // Costruiamo dinamicamente il callbackUrl basato sul pathname corrente
    const callbackUrl = `${pathname}?registered=true`;
    await signIn("google", { callbackUrl });
  };

  return (
    <div className="max-sm:min-w-[300px] max-lg:min-w-[400px] lg:min-w-[450px] mx-auto space-y-4">
      {!isRegistered ? (
        <>
          {/* Sign-Up Form */}
          <AuthForm<SignUpSchemaType>
            schema={SignUpSchema}
            defaultValues={{ username: "", email: "", password: "" }}
            formType="SIGN_UP"
            setIsRegistered={setIsRegistered}
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
        <RegistrationSuccess />
      )}
    </div>
  );
}
