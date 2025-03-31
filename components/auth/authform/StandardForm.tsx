import Link from "next/link";
import React from "react";
import { FieldValues } from "react-hook-form";
import { BiErrorCircle } from "react-icons/bi";
import { FiInfo } from "react-icons/fi";
import { GoAlertFill } from "react-icons/go";
import { IoCloseSharp } from "react-icons/io5";

import { RainbowButton } from "@/components/ui/rainbow-button";
import { useAuth } from "@/context/AuthContext";

import FormField from "./FormField";
import { StandardFormProps } from "./types";

function StandardForm<T extends FieldValues>({
  defaultValues,
  register,
  errors,
  handleSubmit,
  onSubmitAction,
  isSubmitting,
  formType,
  buttonText,
  handleToggleReset,
  children,
  onClose,
}: StandardFormProps<T>) {
  // Otteniamo funzionalità dal context unificato
  const { setSignType, clearError, error } = useAuth();

  // Helper per ottenere icona e stile in base al tipo di errore
  const getFirstValidationError = () => {
    if (!errors) return null;

    // Trova il primo campo con errore
    const firstErrorField = Object.keys(errors).find((key) => errors[key]);

    if (firstErrorField) {
      const error = errors[firstErrorField];
      return {
        fieldName: firstErrorField,
        message: error?.message as string,
      };
    }

    return null;
  };

  return (
    <div className="mx-auto bg-background shadow-lg rounded-lg p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-center text-foreground font-title text-gradient animated-gradient">
          {formType === "SIGN_IN"
            ? "Bentornato in Versia"
            : "Unisciti a Versia"}
        </h2>
        {onClose && (
          <button onClick={onClose}>
            <IoCloseSharp className="h-6 w-6" />
          </button>
        )}
      </div>
      <div className="mx-auto mt-8 px-4 w-full">
        <p className="text-foreground text-sm mb-6 max-w-[400px] mx-auto">
          Versia è un social network per chi ama la scrittura e la lettura.
        </p>
        {children}
        <form
          onSubmit={handleSubmit(onSubmitAction)}
          className="space-y-8 mt-8"
        >
          {/* Visualizza l'errore proveniente dal context o dalla validazione */}
          {(error || getFirstValidationError()) && (
            <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md transition-all duration-300 p-4">
              <div className="">
                <FiInfo className="h-5 w-5 text-red-500" />
              </div>
              <div className="">
                <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                  {error ? error.message : getFirstValidationError()?.message}
                </p>
              </div>
            </div>
          )}

          {Object.keys(defaultValues || {}).map((fieldName) => (
            <FormField
              key={fieldName}
              fieldName={fieldName}
              register={register}
              errors={errors}
              showErrorMessage={false} // Non mostrare errori nei campi
            />
          ))}
          <div className="space-y-6 pt-4">
            {formType === "SIGN_IN" && (
              <p className="text-center text-md text-gray-600 dark:text-gray-200">
                Hai dimenticato la password?{" "}
                <button
                  onClick={(e) => {
                    handleToggleReset(e);
                    clearError();
                  }}
                  className="text-gradient"
                >
                  Clicca qui per il reset
                </button>
              </p>
            )}
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
                <Link
                  href="/sign-up"
                  className="text-gradient lg:hidden"
                  onClick={clearError}
                >
                  Sign Up
                </Link>
                <button
                  className="text-gradient max-lg:hidden"
                  onClick={(e) => {
                    e.preventDefault();
                    clearError();
                    setSignType("signUp");
                  }}
                >
                  Sign Up
                </button>
              </p>
            ) : (
              <p className="text-center text-sm text-gray-600 dark:text-gray-200 mt-3">
                Hai già un account?{" "}
                <Link
                  href="/sign-in"
                  className="text-gradient lg:hidden"
                  onClick={clearError}
                >
                  Sign In
                </Link>
                <button
                  className="text-gradient max-lg:hidden"
                  onClick={(e) => {
                    e.preventDefault();
                    clearError();
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
}

export default StandardForm;
