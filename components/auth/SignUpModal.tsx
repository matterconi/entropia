"use client";

import { signIn } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";

import AuthForm from "@/components/auth/AuthForm";
import RegistrationSuccess from "@/components/auth/RegistrationSuccess";
import { ShinyButton } from "@/components/ui/shiny-button";
import { SignUpSchema } from "@/validations/authSchema";

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignUpModal({ isOpen, onClose }: SignUpModalProps) {
  const [isRegistered, setIsRegistered] = useState(false);

  // Blocca lo scroll quando il modal è aperto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background bg-opacity-50"
      onClick={onClose}
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
              onClose={onClose}
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
          <RegistrationSuccess isModal onClose={onClose} />
        )}
      </div>
    </div>
  );
}
