// File: RegistrationSuccess.tsx
"use client";

import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { IoCloseSharp, IoReload } from "react-icons/io5";
import { MdMarkEmailRead } from "react-icons/md";

import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/context/UserContext";

import { LoadingState } from "./LoadingState";
import { ResendVerification } from "./ResendVerification";
import { SuccessState } from "./SuccessState";
import { RegistrationProps } from "./types";
import { VerificationCodeInput } from "./VerificationCodeInput";
import { VerifyButton } from "./VerifyButton";

export default function RegistrationSuccess({
  isModal,
  onClose,
  email,
}: RegistrationProps) {
  const router = useRouter();
  // Use both context and direct session for maximum reliability
  const { user, loading: contextLoading } = useUser();
  const { message: notificationMessage } = useAuth();
  const { status: sessionStatus } = useSession();
  const [message, setMessage] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCompleted, setVerificationCompleted] = useState(false);
  const [systemNotification, setSystemNotification] = useState<string | null>(
    notificationMessage || null,
  );

  // Stato per il codice di verifica
  const [verificationCode, setVerificationCode] = useState(["", "", "", ""]);

  // Consider loading if either source indicates loading
  const loading = contextLoading || sessionStatus === "loading";

  // Debug logs
  useEffect(() => {
    console.log("Component state:", {
      user,
      contextLoading,
      sessionStatus,
      loading,
      email,
    });
  }, [user, contextLoading, sessionStatus, loading, email]);

  // Timer per decrementare il cooldown ogni secondo
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  useEffect(() => {
    if (notificationMessage) {
      setSystemNotification(notificationMessage);
    }
  }, [notificationMessage]);

  // Show loading state
  if (loading) {
    return <LoadingState />;
  }

  // Check both sources to determine if user is authenticated
  const isAuthenticated = user !== null || sessionStatus === "authenticated";
  const userEmail = email || (user?.email as string);

  // User is authenticated but user object might be null
  if (isAuthenticated && !user && !email) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200 max-w-md">
          <div className="flex items-center justify-center gap-2 text-blue-500">
            <IoReload size={24} className="animate-spin" />
            <p className="text-lg font-medium">Recupero dati utente...</p>
          </div>
        </div>
      </div>
    );
  }

  // Update the handleResendEmail function to reset the verification code
  const handleResendEmail = async () => {
    if (!userEmail) return;
    if (cooldown > 0) return;
    setIsResending(true);
    setMessage(null);

    // Reset the verification code when sending a new email
    setVerificationCode(["", "", "", ""]);

    try {
      const res = await fetch("/api/auth/resend-verification-mail", {
        method: "POST",
        body: JSON.stringify({
          email: userEmail,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Email di verifica inviata di nuovo con successo");
        setCooldown(60);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage("❌ Errore nell'invio della mail.");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyCode = async () => {
    const code = verificationCode.join("");
    if (code.length !== 4) {
      setMessage("❌ Il codice deve essere di 4 cifre.");
      return;
    }

    setIsVerifying(true);
    setMessage(null);

    try {
      // Verifica il codice e completa la registrazione
      const verifyRes = await fetch("/api/auth/complete-registration", {
        method: "POST",
        body: JSON.stringify({
          email: userEmail,
          code,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.success) {
        setMessage(`${verifyData.error || "Codice non valido"}`);
        setIsVerifying(false);
        return;
      }

      // Usa il token JWT restituito per effettuare l'autenticazione
      if (verifyData.token) {
        const signInResult = await signIn("credentials", {
          token: verifyData.token,
          redirect: false,
        });

        if (signInResult?.error) {
          setMessage(`Errore durante l'autenticazione: ${signInResult.error}`);
          setIsVerifying(false);
          return;
        } else {
          setVerificationCompleted(true);
          setMessage("✅ Verifica completata con successo!");

          // Se non è in modalità modale, reindirizza alla home dopo 3 secondi
          if (!isModal) {
            setTimeout(() => {
              router.push("/");
            }, 3000);
          }
        }
      } else {
        setMessage("❌ Token di autenticazione mancante nella risposta");
        setIsVerifying(false);
      }
    } catch (error) {
      console.error("Errore durante la verifica:", error);
      setMessage("❌ Si è verificato un errore durante la verifica");
      setIsVerifying(false);
    }
  };

  // Visualizza lo stato di completamento
  if (verificationCompleted) {
    return <SuccessState isModal={isModal} onClose={onClose} />;
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="bg-background p-8 rounded-lg shadow-lg border border-gray-200 max-w-md">
        {isModal && (
          <IoCloseSharp
            onClick={onClose}
            className="text-foreground cursor-pointer size-8"
          />
        )}

        {/* Notification banner for re-registration */}
        {systemNotification && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-6">
            <IoMdInformationCircleOutline
              size={20}
              className="text-amber-500 mt-0.5 flex-shrink-0"
            />
            <p className="text-sm text-amber-700">{systemNotification}</p>
          </div>
        )}

        {/* Icona Animata */}
        <div className="flex items-center justify-center w-20 h-20 mx-auto bg-blue-100 text-blue-600 rounded-full shadow-lg mb-4">
          <MdMarkEmailRead size={50} />
        </div>

        {/* Messaggio di conferma */}
        <h2 className="text-3xl font-bold text-gradient font-title mb-4 text-center">
          Ci siamo quasi!
        </h2>
        <p className="text-foreground mt-2 text-center">
          Abbiamo inviato un codice di verifica a <strong>{userEmail}</strong>.
          <br />
          Inserisci il codice di 4 cifre per completare la registrazione.
        </p>

        {/* Input per il codice di verifica */}
        <VerificationCodeInput
          verificationCode={verificationCode}
          setVerificationCode={setVerificationCode}
        />

        {/* Messaggio di errore o successo */}
        {message && (
          <p
            className={`mt-8 mb-4 p-2 rounded-lg text-center ${
              message.startsWith("✅")
                ? "text-green-700 bg-green-100"
                : "text-red-700 bg-red-100"
            }`}
          >
            {message}
          </p>
        )}

        {/* Pulsante per verificare il codice */}
        <div className={`${message ? "mt-0" : "mt-8"}`}>
          <VerifyButton onClick={handleVerifyCode} isVerifying={isVerifying} />
        </div>

        {/* Pulsante per inviare di nuovo l'email */}
        <ResendVerification
          isResending={isResending}
          cooldown={cooldown}
          handleResendEmail={handleResendEmail}
        />
      </div>
    </div>
  );
}
