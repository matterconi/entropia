"use client";

import Link from "next/link";
import React from "react";
import { DefaultValues, FieldValues, Path, useForm } from "react-hook-form";
import { IoCloseSharp } from "react-icons/io5";

import { Input } from "@/components/auth/SignInput";
import { RainbowButton } from "@/components/ui/rainbow-button";

interface ResetPasswordFormProps<T extends FieldValues> {
  onSubmit: (data: T) => Promise<void>;
  defaultValues: DefaultValues<T>;
  onClose?: () => void;
}

export default function ResetPasswordForm<T extends FieldValues>({
  onSubmit,
  defaultValues,
}: ResetPasswordFormProps<T>) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<T>({ defaultValues });

  return (
    <div className="w-full h-full border-gradient p-[1px] animated-gradient rounded-lg max-w-md min-w-screen">
      <div className="mx-auto bg-background shadow-lg rounded-lg p-8 h-full flex items-center justify-center flex-col">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-center text-foreground font-title text-gradient animated-gradient">
            Reset Password
          </h2>
        </div>
        <p className="mt-4">
          Inserisci una nuova password per modificare la password prcedente
        </p>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-8 mt-12  w-full"
        >
          {/* New Password */}
          <div className="flex flex-col gap-2 relative">
            <label className="absolute -top-3 left-4 bg-background px-2 text-sm font-semibold text-foreground">
              Nuova Password
            </label>
            <div className="w-full h-full border-gradient p-[1px] animated-gradient rounded-lg ">
              <Input
                {...register("newPassword" as Path<T>)}
                type="password"
                placeholder="Inserisci la nuova password"
                className="bg-background w-full h-full p-2 rounded-lg transition"
              />
            </div>
            {errors["newPassword" as Path<T>] && (
              <p className="text-red-500 text-sm">
                {errors["newPassword" as Path<T>]?.message as string}
              </p>
            )}
          </div>
          {/* Confirm Password */}
          <div className="flex flex-col gap-2 relative">
            <label className="absolute -top-3 left-4 bg-background px-2 text-sm font-semibold text-foreground">
              Conferma Password
            </label>
            <div className="w-full h-full border-gradient p-[1px] animated-gradient rounded-lg">
              <Input
                {...register("confirmPassword" as Path<T>)}
                type="password"
                placeholder="Conferma la nuova password"
                className="bg-background w-full h-full p-2 rounded-lg transition"
              />
            </div>
            {errors["confirmPassword" as Path<T>] && (
              <p className="text-red-500 text-sm">
                {errors["confirmPassword" as Path<T>]?.message as string}
              </p>
            )}
          </div>
          <div className="space-y-6 pt-4">
            <RainbowButton
              type="submit"
              disabled={isSubmitting}
              className="w-full text-white dark:text-black py-3 rounded-md transition shadow-md"
            >
              {isSubmitting ? "Processing..." : "Reset Password"}
            </RainbowButton>
          </div>
        </form>
        <div className="pt-4">
          <p className="text-center text-sm text-gray-600 dark:text-gray-200 mt-3">
            Hai già un account?{" "}
            <Link href="/sign-in" className="text-gradient">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
