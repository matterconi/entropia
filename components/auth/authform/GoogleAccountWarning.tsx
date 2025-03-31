import Link from "next/link";
import React from "react";
import { FieldValues, Path } from "react-hook-form";
import { FaExclamationCircle } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";

import { Input } from "@/components/auth/SignInput";
import { RainbowButton } from "@/components/ui/rainbow-button";

import { GoogleAccountWarningProps } from "./types";

const GoogleAccountWarning = <T extends FieldValues>({
  defaultValues,
  register,
  errors,
  isSubmitting,
  onSubmit,
  buttonText,
  formType,
  children,
  onClose,
  setSignType,
}: GoogleAccountWarningProps<T>) => {
  return (
    <div className="mx-auto bg-background shadow-lg rounded-lg p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-center text-foreground font-title text-gradient animated-gradient">
          <FaExclamationCircle className="inline text-red-500" />
        </h2>
        {onClose && (
          <button onClick={onClose}>
            <IoCloseSharp className="h-6 w-6" />
          </button>
        )}
      </div>
      <div className="mx-auto mt-8 px-4 w-full">
        <p className="text-foreground text-sm mb-6 max-w-[400px] mx-auto">
          Questa email è già associata a un account Google. Se vuoi, puoi
          procedere con la registrazione manuale e associare i due account. O
          continuare l&apos;autenticazione con Google
        </p>
        {children}
        <form onSubmit={onSubmit} className="space-y-8 mt-8">
          {Object.keys(defaultValues || {}).map((fieldName) => (
            <div
              key={fieldName}
              className={`${fieldName !== "username" ? "flex flex-col gap-2 relative" : "hidden"}`}
            >
              <label className="absolute -top-3 left-4 bg-background px-2 text-sm font-semibold text-foreground">
                {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
              </label>
              <div className="w-full h-full border-gradient p-[1px] animated-gradient rounded-lg">
                <Input
                  {...register(fieldName as Path<T>)}
                  type={fieldName === "password" ? "password" : "text"}
                  placeholder={
                    fieldName === "password"
                      ? "V3rs14!3xmpl"
                      : fieldName === "email"
                        ? "versia@example.com"
                        : "Versia"
                  }
                  className="bg-background w-full h-full p-2 rounded-lg transition"
                />
              </div>
              {errors[fieldName as Path<T>] && (
                <p className="text-red-500 text-sm">
                  {errors[fieldName as Path<T>]?.message as string}
                </p>
              )}
            </div>
          ))}
          <div className="space-y-6 pt-4">
            <RainbowButton
              type="submit"
              disabled={isSubmitting}
              className="w-full text-white dark:text-black py-3 rounded-md transition shadow-md"
            >
              {isSubmitting ? "Processing..." : buttonText}
            </RainbowButton>
          </div>
          <div className="pt-4">
            {formType === "SIGN_IN" ? (
              <p className="text-center text-sm text-gray-600 dark:text-gray-200 mt-3">
                Non hai un account?{" "}
                <Link href="/sign-up" className="text-gradient lg:hidden">
                  Sign Up
                </Link>
                <button
                  className="text-gradient max-lg:hidden"
                  onClick={(e) => {
                    e.preventDefault();
                    setSignType("signUp");
                  }}
                >
                  Sign Up
                </button>
              </p>
            ) : (
              <p className="text-center text-sm text-gray-600 dark:text-gray-200 mt-3">
                Hai già un account?{" "}
                <Link href="/sign-in" className="text-gradient lg:hidden">
                  Sign In
                </Link>
                <button
                  className="text-gradient max-lg:hidden"
                  onClick={(e) => {
                    e.preventDefault();
                    setSignType("signIn");
                  }}
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoogleAccountWarning;
