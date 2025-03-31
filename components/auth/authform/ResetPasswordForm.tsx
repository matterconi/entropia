import React from "react";
import { FieldValues } from "react-hook-form";
import { IoCloseSharp } from "react-icons/io5";

import { RainbowButton } from "@/components/ui/rainbow-button";

import FormField from "./FormField";
import { ResetPasswordFormProps } from "./types";

function ResetPasswordForm<T extends FieldValues>({
  defaultValues,
  register,
  errors,
  handleSubmit,
  onSubmitAction,
  children,
  onClose,
  resetMailSent,
  setResetMailSent,
  setIsResetting,
}: ResetPasswordFormProps<T>) {
  if (!resetMailSent) {
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
        <p className="mt-8 text-center text-base text-foreground">
          Puoi effettuare l&apos;accesso con Google
        </p>
        {children}
        <p className="my-10 text-center text-base text-foreground">
          Inserisci l&apos;email dell&apos;account da ripristinare.
        </p>
        {Object.keys(defaultValues || {}).map((fieldName) => (
          <FormField
            key={fieldName}
            fieldName={fieldName}
            register={register}
            errors={errors}
          />
        ))}
        <RainbowButton
          type="submit"
          onClick={handleSubmit(onSubmitAction)}
          className="mt-10 mb-4"
        >
          Reset Password
        </RainbowButton>
      </div>
    );
  }

  return (
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
  );
}

export default ResetPasswordForm;
