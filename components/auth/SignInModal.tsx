"use client";

import { signIn } from "next-auth/react";
import React, { useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { IoCloseSharp } from "react-icons/io5";

import AuthForm from "@/components/auth/AuthForm";
import { ShinyButton } from "@/components/ui/shiny-button";
import { SignInSchema, SignInSchemaType } from "@/validations/authSchema";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignInModal({ isOpen, onClose }: SignInModalProps) {
  // Blocca lo scroll quando il modal è aperto
  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflowY = "hidden";
      document.body.style.overflowY = "hidden";
    } else {
      document.documentElement.style.overflowY = "auto";
      document.body.style.overflowY = "auto";
    }

    return () => {
      document.documentElement.style.overflowY = "auto";
      document.body.style.overflowY = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Gestione del Google Sign-In
  const handleGoogleSignIn = async () => {
    const result = await signIn("google", { callbackUrl: "/" });
    if (!result?.error) {
      onClose();
    }
  };

  // Gestione del Sign-In tramite credenziali
  const handleSignIn = async (data: SignInSchemaType) => {
    const result = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (result?.error) {
      console.error("Login failed:", result.error);
    } else {
      console.log("Login successful!");
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 h-full w-full overflow-y-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="h-screen w-screen fixed bg-black bg-opacity-50 flex items-center justify-center overflow-y-hidden">
        <div className="relative bg-white p-6 rounded-lg shadow-lg max-sm:min-w-[300px] max-lg:min-w-[400px] lg:min-w-[450px] mx-auto space-y-4 z-50">
          <button onClick={onClose} className="absolute top-4 right-4">
            <IoCloseSharp className="h-6 w-6" />
          </button>

          {/* ✅ Form di autenticazione correttamente posizionato */}
          <AuthForm<SignInSchemaType>
            schema={SignInSchema}
            defaultValues={{ email: "", password: "" }}
            formType="SIGN_IN"
            onSubmitAction={handleSignIn}
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
              <span className="text-sm text-gray-500 dark:text-gray-400">or</span>
              <hr className="flex-1 border-gray-300 dark:border-gray-600" />
            </div>
          </AuthForm>
        </div>
      </div>
    </div>
  );
}
