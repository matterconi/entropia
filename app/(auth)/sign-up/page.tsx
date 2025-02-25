"use client";

import { signIn } from "next-auth/react";
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";

import AuthForm from "@/components/auth/AuthForm";
import RegistrationSuccess from "@/components/auth/RegistrationSuccess";
import { ShinyButton } from "@/components/ui/shiny-button";
import { SignUpSchema } from "@/validations/authSchema";

export default function SignUpPage() {
  const [isRegistered, setIsRegistered] = useState(false);
  console.log(isRegistered);
  // Function to handle Google Sign-Up
  const handleGoogleSignUp = async () => {
    await signIn("google", { callbackUrl: "/" }); // Redirect to homepage after signup
  };

  return (
    <div className="max-sm:min-w-[300px] max-lg:min-w-[400px] lg:min-w-[450px] mx-auto space-y-4">
      {/* Sign-Up Form */}
      {!isRegistered ? (
        <AuthForm
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
            <span className="text-sm text-gray-500 dark:text-gray-400">or</span>
            <hr className="flex-1 border-gray-300 dark:border-gray-600" />
          </div>
        </AuthForm>
      ) : (
        <RegistrationSuccess />
      )}
    </div>
  );
}
