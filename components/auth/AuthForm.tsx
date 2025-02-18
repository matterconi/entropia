"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import React from "react";
import { DefaultValues, FieldValues, Path, useForm } from "react-hook-form";
import { ZodObject, ZodType } from "zod";

import { Input } from "@/components/auth/SignInput";
import { RainbowButton } from "@/components/ui/rainbow-button";

interface AuthFormProps<T extends FieldValues> {
  schema: ZodObject<{ [key in keyof T]: ZodType<any> }>; // ✅ Tipo corretto per ZodObject
  defaultValues: DefaultValues<T>; // ✅ Ora è tipizzato correttamente
  formType: "SIGN_IN" | "SIGN_UP";
  children: React.ReactNode;
  onSubmitAction: (data: T) => Promise<void>;
}

export default function AuthForm<T extends FieldValues>({
  schema,
  defaultValues,
  formType,
  children,
  onSubmitAction,
}: AuthFormProps<T>) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues, // ✅ Ora accetta correttamente i valori di default
  });

  const buttonText = formType === "SIGN_IN" ? "Sign In" : "Sign Up";

  return (
    <div className="w-full h-full border-gradient p-[1px] animated-gradient rounded-lg">
      <div className="mx-auto bg-background shadow-lg rounded-lg p-8 w-full h-full">
        <h2 className="text-3xl font-bold text-center text-foreground mb-6 font-title text-gradient animated-gradient">
          {formType === "SIGN_IN" ? "Entra in Versia" : "Registrati su Versia"}
        </h2>
        <p className="text-foreground text-sm mb-6 max-w-[400px] mx-auto">
          Versia è un social network per chi ama la scrittura e la lettura.
          Condividi i tuoi pensieri, le tue storie e le tue poesie con una
          community di appassionati come te.
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
          <RainbowButton
            type="submit"
            disabled={isSubmitting}
            className="w-full text-white dark:text-black py-3 rounded-md transition shadow-md"
          >
            {isSubmitting ? "Processing..." : buttonText}
          </RainbowButton>

          {formType === "SIGN_IN" ? (
            <p className="text-center text-sm text-gray-600 dark:text-gray-200 mt-3">
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="text-gradient">
                Sign Up
              </Link>
            </p>
          ) : (
            <p className="text-center text-sm text-gray-600 dark:text-gray-200 mt-3">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-gradient">
                Sign In
              </Link>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
