"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import React, { useEffect, useRef, useState } from "react";
import { DefaultValues, FieldValues, useForm } from "react-hook-form";

import { FormType, useAuth } from "@/context/AuthContext"; // Importa anche FormType

import ErrorView from "./ErrorView";
import GoogleAccountWarning from "./GoogleAccountWarning";
import ResetPasswordForm from "./ResetPasswordForm";
import StandardForm from "./StandardForm";
import { AuthFormProps } from "./types";

export default function AuthForm<T extends FieldValues>({
  schema,
  defaultValues,
  formType: initialFormType, // Rinominiamo per chiarezza
  setIsRegistered,
  onClose,
  setIsResetting,
  setRegistrationData,
  children,
}: AuthFormProps<T>) {
  // Otteniamo il tipo di sign dal context
  const {
    signType,
    convertSignTypeToFormType,
    error,
    setError,
    clearError,
    setMessage,
  } = useAuth();

  // Stato locale per il tipo di form, sincronizzato con signType dal context
  const [formType, setFormType] = useState<FormType>(initialFormType);

  // Flag per tracciare se è il primo render
  const isFirstRender = useRef(true);
  // Flag per tracciare se il cambio di tipo è dovuto a un errore
  const isErrorTypeChange = useRef(false);
  // Riferimento per tenere traccia dei valori correnti del form
  const currentValues = useRef<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    getValues,
  } = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const [resetMailSent, setResetMailSent] = useState<boolean>(false);
  const [hasGoogleAccount, setHasGoogleAccount] = useState<boolean>(false);
  const { setSignType, closeModal } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  console.log("Rendering AuthForm with type:", formType);

  // Sincronizziamo formType con signType quando signType cambia nel context
  useEffect(() => {
    if (!signType || formType === "RESET_PASS") return;

    const newFormType = convertSignTypeToFormType(signType);
    console.log(
      `Synchronizing form type from ${formType} to ${newFormType} based on context signType: ${signType}`,
    );

    // Cambia il tipo di form solo se è diverso
    if (formType !== newFormType) {
      // Salva i valori correnti prima del cambio di tipo
      if (!isErrorTypeChange.current) {
        currentValues.current = getValues();
      }

      setFormType(newFormType);

      // Reset del form con i valori di default solo se non è dovuto a un errore
      // e non è il primo render
      if (!isErrorTypeChange.current && !isFirstRender.current) {
        // Reset con valori di default per il nuovo tipo
        console.log("Resetting form with default values for new type");
        if (newFormType === "SIGN_IN") {
          reset({ email: "", password: "" } as any);
        } else if (newFormType === "SIGN_UP") {
          reset({ email: "", "conferma email": "", password: "" } as any);
        }
      } else {
        console.log(
          "Skipping form reset due to error type change or first render",
        );
        isErrorTypeChange.current = false;
      }
    }

    isFirstRender.current = false;
  }, [signType, convertSignTypeToFormType, formType, reset, getValues]);

  // Rimuoviamo l'effect che resetta il form ogni volta che cambia formType o clearError
  // useEffect(() => {
  //   reset(defaultValues as DefaultValues<T>);
  // }, [formType, reset, defaultValues, clearError]);

  const onSubmitAction = async (data: T) => {
    // Salva i valori del form prima di procedere
    currentValues.current = data;

    clearError(); // Pulisci eventuali errori precedenti
    console.log(`Submitting ${formType} form with data:`, data);

    if (formType === "RESET_PASS") {
      // Gestione reset password
      try {
        const res = await fetch("/api/reset-pass-mail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (!res.ok) {
          setError({
            type: "GENERAL",
            message: result.error,
          });
          console.error("Error sending reset mail:", result.error);
          return;
        }
        setResetMailSent(true);
        return;
      } catch (err) {
        setError({
          type: "SERVER_ERROR",
          message:
            "Si è verificato un errore durante l'invio dell'email di reset",
        });
        return;
      }
    }

    if (hasGoogleAccount) {
      // Gestione caso account Google
      try {
        const res = await fetch("/api/auth/manual/has-google-account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (!res.ok) {
          setError({
            type: "GENERAL",
            message: result.error,
          });
          console.error("Error handling Google account:", result.error);
          return;
        }
        // Chiamata a signIn
        const response = await signIn("credentials", {
          email: (data as any).email,
          password: (data as any).password,
          redirect: false,
        });
        console.log("signIn response:", response);

        if (response?.error) {
          setError({
            type: "INVALID_CREDENTIALS",
            message: response.error,
          });
          return;
        }
        setHasGoogleAccount(false);
        if (formType === "SIGN_UP" && setIsRegistered) {
          setIsRegistered(true);
        }

        if (pathname === "/sign-in") {
          router.push("/");
        } else {
          closeModal?.();
        }

        return;
      } catch (err) {
        setError({
          type: "SERVER_ERROR",
          message: "Si è verificato un errore durante l'autenticazione",
        });
        return;
      }
    }

    // Gestione dei casi SIGN_IN / SIGN_UP
    const endpoint =
      formType === "SIGN_UP"
        ? "/api/auth/manual/sign-up"
        : "/api/auth/manual/sign-in";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      // Gestione errori
      if (!res.ok) {
        // Usa le informazioni di errore strutturate dall'API
        const errorType = result.errorType || "GENERAL";
        const errorMessage = result.error;
        const email = (data as any).email || result.email;

        // Aggiungiamo un flag per indicare se dovrebbe cambiare il tipo di sign
        const shouldChangeSignType =
          errorType === "USER_NOT_FOUND" ||
          errorType === "EMAIL_EXISTS" ||
          errorType === "EMAIL_ALREADY_EXISTS";

        if (shouldChangeSignType) {
          // Segna che il prossimo cambio di tipo sarà dovuto a un errore
          isErrorTypeChange.current = true;
        }

        setError({
          type: errorType,
          message: errorMessage,
          email,
          shouldChangeSignType,
        });
        return;
      }

      // Caso account Google esistente
      if (result && "hasGoogleAccount" in result && result.hasGoogleAccount) {
        setHasGoogleAccount(true);
        console.log("User has Google account");
        return;
      }

      // Caso registrazione con processo in due fasi
      if (formType === "SIGN_UP" && result && result.registrationToken) {
        const regToken = result.registrationToken;
        const regEmail = (data as any).email || result.email;

        console.log("Registration successful, token received:", regToken);
        console.log("Registration email:", regEmail);

        if (result.notificationMessage) {
          setMessage(result.notificationMessage);
        }

        // Aggiorna lo stato isRegistered
        if (setIsRegistered) {
          console.log("Setting isRegistered to true");
          setIsRegistered(true);
        }

        // Passa i dati al componente parent
        if (setRegistrationData) {
          console.log("Passing registration data to parent");
          setRegistrationData({
            email: regEmail,
            registrationToken: regToken,
          });
        }

        return;
      }

      // Chiamata a signIn per il caso SIGN_IN
      if (formType === "SIGN_IN") {
        const response = await signIn("credentials", {
          email: (data as any).email,
          password: (data as any).password,
          redirect: false,
        });
        console.log("signIn response:", response);

        if (response?.error) {
          // Determina se dovrebbe passare a registrazione in base all'errore
          const shouldChangeSignType =
            response.error.includes("User not found");

          if (shouldChangeSignType) {
            // Segna che il prossimo cambio di tipo sarà dovuto a un errore
            isErrorTypeChange.current = true;
          }

          setError({
            type: "INVALID_CREDENTIALS",
            message: response.error,
            shouldChangeSignType,
          });
          return;
        }

        if (pathname === "/sign-in") {
          router.push("/");
        } else {
          closeModal?.();
        }
      }
    } catch (err) {
      setError({
        type: "SERVER_ERROR",
        message: "Si è verificato un errore durante l'autenticazione",
      });
    }
  };

  const handleToggleReset = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("Toggling reset");
    clearError(); // Pulisci errori quando cambi form
    setIsResetting?.((prev) => !prev);
  };

  const buttonText = formType === "SIGN_IN" ? "Sign In" : "Sign Up";

  // Rendering condizionale basato sullo stato
  // Usa ErrorView solo per errori critici
  if (
    error &&
    (error.type === "SERVER_ERROR" || error.type === "VERIFICATION_EXPIRED")
  ) {
    return <ErrorView error={error} />;
  }

  if (hasGoogleAccount) {
    return (
      <div className="w-full h-full border-gradient p-[1px] animated-gradient rounded-lg">
        <GoogleAccountWarning
          defaultValues={currentValues.current || defaultValues}
          register={register}
          errors={errors}
          isSubmitting={isSubmitting}
          onSubmit={onSubmitAction}
          buttonText={buttonText}
          formType={formType as "SIGN_IN" | "SIGN_UP"}
          onClose={onClose}
          setSignType={(type) => {
            clearError(); // Pulisci errori quando cambi tipo di sign
            setSignType(type as any);
          }}
        >
          {children}
        </GoogleAccountWarning>
      </div>
    );
  }

  return (
    <div className="max-w-screen w-[350px] md:w-[450px] lg:w-[450px] xl:w-[500px]">
      <div className="w-full h-full border-gradient p-[1px] animated-gradient rounded-lg">
        {formType !== "RESET_PASS" ? (
          <StandardForm
            defaultValues={currentValues.current || defaultValues}
            register={register}
            errors={errors}
            handleSubmit={handleSubmit}
            onSubmitAction={onSubmitAction}
            isSubmitting={isSubmitting}
            formType={formType as "SIGN_IN" | "SIGN_UP"}
            buttonText={buttonText}
            handleToggleReset={handleToggleReset}
            onClose={onClose}
            authError={error} // Passa l'errore allo StandardForm
            clearAuthError={clearError} // Passa la funzione per pulire l'errore
          >
            {children}
          </StandardForm>
        ) : (
          <ResetPasswordForm
            defaultValues={currentValues.current || defaultValues}
            register={register}
            errors={errors}
            handleSubmit={handleSubmit}
            onSubmitAction={onSubmitAction}
            onClose={onClose}
            resetMailSent={resetMailSent}
            setResetMailSent={setResetMailSent}
            setIsResetting={setIsResetting}
          >
            {children}
          </ResetPasswordForm>
        )}
      </div>
    </div>
  );
}
