"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { signIn } from "next-auth/react";
import React, { useState } from "react";
import { DefaultValues, FieldValues, Path, useForm } from "react-hook-form";
import { IoCloseSharp } from "react-icons/io5";
import { ZodObject, ZodType } from "zod";

import { Input } from "@/components/auth/SignInput";
import { RainbowButton } from "@/components/ui/rainbow-button";

const ResetModal = ({ onClose }) => {
  return (
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
      <p className="mt-8 text-center text-sm text-foreground">
        Inserisci l'email dell'account da ripristinare.
      </p>
      <form onSubmit={handleSubmit(onSubmitAction)} className="space-y-8 mt-8">
        <div className="flex flex-col gap-2 relative">
          <label className="absolute -top-3 left-4 bg-background px-2 text-sm font-semibold text-foreground">
            Email
          </label>
          <div className="w-full h-full border-gradient p-[1px] animated-gradient rounded-lg">
            <Input
              {...register("email" as Path<T>)}
              type="text"
              placeholder="versia@example.com"
              className="bg-background w-full h-full p-2 rounded-lg transition"
            />
          </div>
          {errors["email" as Path<T>] && (
            <p className="text-red-500 text-sm">
              {errors["email" as Path<T>]?.message as string}
            </p>
          )}
        </div>
        <div className="space-y-6 pt-4">
          <RainbowButton
            type="submit"
            disabled={isSubmitting}
            className="w-full text-white dark:text-black py-3 rounded-md transition shadow-md"
          >
            {isSubmitting ? "Processing..." : "Invia email di reset"}
          </RainbowButton>
        </div>
        <div className="pt-4">
          <p className="text-center text-sm text-gray-600 dark:text-gray-200 mt-3">
            Hai già un account?{" "}
            <Link href="/sign-in" className="text-gradient">
              Sign In
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default ResetModal;
