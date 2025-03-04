"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import React, { useState } from "react";
import { DefaultValues, FieldValues, Path, useForm } from "react-hook-form";
import { FiAlertCircle } from "react-icons/fi";
import { IoCloseSharp } from "react-icons/io5";
import { ZodObject, ZodType } from "zod";

import { Input } from "@/components/auth/SignInput";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { useSignModal } from "@/context/SignModalContext";

interface AuthFormProps<T extends FieldValues> {
  schema: ZodObject<{ [key in keyof T]: ZodType<any> }>;
  defaultValues: DefaultValues<T>;
  formType: "SIGN_IN" | "SIGN_UP" | "RESET_PASS";
  onClose?: () => void;
  children: React.ReactNode;
  setIsRegistered?: React.Dispatch<React.SetStateAction<boolean>>;
  setIsResetting?: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AuthForm<T extends FieldValues>({
  schema,
  defaultValues,
  formType,
  setIsRegistered,
  onClose,
  setIsResetting,
  children,
}: AuthFormProps<T>) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<T>({ resolver: zodResolver(schema), defaultValues });

  const [error, setError] = useState<string | null>(null);
  const [resetMailSent, setResetMailSent] = useState<boolean>(false);
  const { setSignType, closeModal } = useSignModal();
  const pathname = usePathname();
  const router = useRouter();

  console.log("Rendering AuthForm with type:", formType);
  const onSubmitAction = async (data: T) => {
    setError(null);
    console.log("Submitting form with data:", data);
    if (formType === "RESET_PASS") {
      // Chiama la route dedicata per inviare l'email di reset password
      const res = await fetch("/api/reset-pass-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error);
        console.error("Error sending reset mail:", result.error);
        return;
      }
      setResetMailSent(true);
      return;
    }

    // Gestione dei casi SIGN_IN / SIGN_UP
    const endpoint =
      formType === "SIGN_UP"
        ? "/api/auth/manual/sign-up"
        : "/api/auth/manual/sign-in";

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      setError(result.error);
      return;
    }

    // Chiamata a signIn per entrambi i casi
    const response = await signIn("credentials", {
      email: (data as any).email,
      password: (data as any).password,
      redirect: false,
    });
    console.log("signIn response:", response);

    if (response?.error) {
      setError(response.error);
      return;
    }

    if (formType === "SIGN_IN") {
      if (pathname === "/sign-in") {
        router.push("/");
      } else {
        closeModal?.();
      }
    }

    // Se era SIGN_UP, aggiorna lo stato
    if (formType === "SIGN_UP" && setIsRegistered) {
      setIsRegistered(true);
    }
  };

  const handleToggleReset = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("Toggling reset");
    setIsResetting?.((prev) => !prev);
  };

  const buttonText = formType === "SIGN_IN" ? "Sign In" : "Sign Up";

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md text-center">
          <div className="flex flex-col items-center">
            <FiAlertCircle className="w-20 h-20 text-red-500 mb-8 mt-4" />
            <p className="text-xl text-gray-700 mb-2">
              Hey Houston, abbiamo un{" "}
            </p>
            <h2 className="text-4xl font-bold text-red-500">Problema 😞</h2>
            <p className="text-xl text-red-700 mt-8">{error}</p>
            <div className="mt-8">
              <Link href="/">
                <RainbowButton className="px-4 py-2 mb-6">
                  Torna alla home
                </RainbowButton>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full border-gradient p-[1px] animated-gradient rounded-lg">
      {formType !== "RESET_PASS" ? (
        // UI per SIGN_IN / SIGN_UP
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
              {Object.keys(defaultValues || {}).map((fieldName) => (
                <div key={fieldName} className="flex flex-col gap-2 relative">
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
                {formType === "SIGN_IN" && (
                  <p className="text-center text-md text-gray-600 dark:text-gray-200">
                    Hai dimenticato la password?{" "}
                    <button
                      onClick={handleToggleReset}
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
      ) : !resetMailSent ? (
        // UI per reset password: chiede solo l'email
        <div className="mx-auto bg-background shadow-lg rounded-lg p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-center text-foreground font-title text-gradient animated-gradient">
              Reset Password
            </h2>
            {onClose && (
              <button onClick={onClose}>
                <IoCloseSharp className="h-6 w-6" />
              </button>
            )}
          </div>
          <p className="mt-8 text-center text-base text-foreground">
            Puoi effettuare l&apos;accesso con Google
          </p>
          {children}
          <p className="my-10 text-center text-base text-foreground">
            Inserisci l&apos;email dell&apos;account da ripristinare.
          </p>
          {Object.keys(defaultValues || {}).map((fieldName) => (
            <div key={fieldName} className="flex flex-col gap-2 relative">
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
          <RainbowButton
            type="submit"
            onClick={handleSubmit(onSubmitAction)}
            className="mt-10 mb-4"
          >
            Reset Password
          </RainbowButton>
        </div>
      ) : (
        // UI per conferma email inviata
        <div className="mx-auto bg-background shadow-lg rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-foreground">Email inviata!</h2>
          <p className="mt-4 text-sm text-foreground">
            Controlla la tua casella email per le istruzioni sul reset della
            password.
          </p>
          <div className="pt-8">
            <RainbowButton
              onClick={() => {
                setResetMailSent(false);
                setIsResetting?.(false);
              }}
            >
              Torna al Sign In
            </RainbowButton>
          </div>
        </div>
      )}
    </div>
  );
}
