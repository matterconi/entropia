"use client";

import { signIn } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";

import AuthForm from "@/components/auth/AuthForm";
import { ShinyButton } from "@/components/ui/shiny-button";
import {
  ForgotPasswordSchema,
  ForgotPasswordSchemaType,
  SignInSchema,
  SignInSchemaType,
} from "@/validations/authSchema";
import { IoCloseSharp } from "react-icons/io5";
import { RainbowButton } from "../ui/rainbow-button";
import { useUser } from "@/context/UserContext"; // Assicurati di usare il percorso corretto
import Link from "next/link";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignInModal({ isOpen, onClose }: SignInModalProps) {
  // Blocca lo scroll quando il modal è aperto
  const [isResetting, setIsResetting] = useState(false);
  const { user, loading } = useUser();

  useEffect(() => {
    console.log("isResetting:", isResetting);
  }, [isResetting]);
  if (!isOpen) return null;
  // Gestione del Google Sign-In
  const handleGoogleSignIn = async () => {
    const result = await signIn("google", { callbackUrl: "/" });
    if (!result?.error) {
      onClose();
    }
  };

  if (loading) {
    return (
      <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background bg-opacity-50"
      onClick={onClose}
      >
      <div
        className="relative max-sm:min-w-[300px] max-lg:min-w-[400px] lg:min-w-[450px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full h-full border-gradient p-[1px] animated-gradient rounded-lg">
        <div className="mx-auto bg-background shadow-lg rounded-lg p-8 min-h-[400px]">
          <div className="flex items-center justify-between">
            {onClose && (
              <button onClick={onClose}>
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

  if (user) {
    return (
      <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background bg-opacity-50"
      onClick={onClose}
      >
      <div
        className="relative max-sm:min-w-[300px] max-lg:min-w-[400px] lg:min-w-[450px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full h-full border-gradient p-[1px] animated-gradient rounded-lg">
        <div className="mx-auto bg-background shadow-lg rounded-lg p-8 min-h-[400px] flex flex-col justify-center py-16">
          <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Sei già autenticato</h2>
            {onClose && (
              <button onClick={onClose}>
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
      onClick={onClose}
    >
      <div
        className="relative max-sm:min-w-[300px] max-lg:min-w-[400px] lg:min-w-[450px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ✅ Form di autenticazione correttamente posizionato */}
        {!isResetting ? (
          <AuthForm<SignInSchemaType>
            schema={SignInSchema}
            defaultValues={{ email: "", password: "" }}
            formType="SIGN_IN"
            setIsResetting={setIsResetting}
          >
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

            <div className="flex items-center gap-2">
              <hr className="flex-1 border-gray-300 dark:border-gray-600" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                or
              </span>
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
              <span className="text-sm text-gray-500 dark:text-gray-400">
                o
              </span>
              <hr className="flex-1 border-gray-300 dark:border-gray-600" />
            </div>
          </AuthForm>
        )}
      </div>
    </div>
  );
}
