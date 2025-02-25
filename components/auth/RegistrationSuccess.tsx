"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { FiMail } from "react-icons/fi";
import { IoCloseSharp, IoReload } from "react-icons/io5";
import { MdMarkEmailRead } from "react-icons/md";

import { useUser } from "@/context/UserContext";

import { RainbowButton } from "../ui/rainbow-button";
import { ShinyButton } from "../ui/shiny-button";

export default function RegistrationSuccess({
  isModal,
  onClose,
}: {
  isModal?: boolean;
  onClose?: () => void;
}) {
  // Use both context and direct session for maximum reliability
  const { user, loading: contextLoading } = useUser();
  const { status: sessionStatus } = useSession();
  const [message, setMessage] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Consider loading if either source indicates loading
  const loading = contextLoading || sessionStatus === "loading";

  // Debug logs
  useEffect(() => {
    console.log("Component state:", {
      user,
      contextLoading,
      sessionStatus,
      loading,
    });
  }, [user, contextLoading, sessionStatus, loading]);

  // Timer per decrementare il cooldown ogni secondo
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200 max-w-md">
          <div className="flex items-center justify-center gap-2 text-blue-500">
            <IoReload size={24} className="animate-spin" />
            <p className="text-lg font-medium">Caricamento...</p>
          </div>
        </div>
      </div>
    );
  }

  // Check both sources to determine if user is authenticated
  const isAuthenticated = user !== null || sessionStatus === "authenticated";

  // Show unauthenticated state
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-500">⚠️ Errore</h2>
          <p>Non sei autenticato. Riprova ad accedere.</p>
          <Link href="/sign-in" className="mt-4 text-blue-600 hover:underline">
            🔑 Vai al login
          </Link>
        </div>
      </div>
    );
  }

  // User is definitely authenticated but user object might be null
  if (!user) {
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

  const isDisabled = isResending || cooldown > 0;

  const handleResendEmail = async () => {
    if (!user.email) return;
    if (cooldown > 0) return;
    setIsResending(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/resend-verification-mail", {
        method: "POST",
        body: JSON.stringify({ email: user.email }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Email di verifica inviata con successo!");
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

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200 max-w-md">
        {isModal && (
          <IoCloseSharp
            onClick={onClose}
            className="text-foreground cursor-pointer size-8"
          />
        )}
        {/* Icona Animata */}
        <div className="flex items-center justify-center w-20 h-20 mx-auto bg-green-100 text-green-600 rounded-full shadow-lg mb-4">
          <MdMarkEmailRead size={50} />
        </div>

        {/* Messaggio di conferma */}
        <h2 className="text-3xl font-bold text-gradient font-title mb-4 text-center">
          Registrazione completata!
        </h2>
        <p className="text-gray-700 mt-2">
          Controlla la tua email per confermare il tuo account.
        </p>

        {message && (
          <p
            className={`my-4 p-2 rounded-lg ${
              message.startsWith("E")
                ? " text-green-700 bg-green-100"
                : " text-red-700"
            }`}
          >
            {message} All&apos;indirizzo <strong>{user.email}</strong>
          </p>
        )}

        {/* Pulsante per inviare di nuovo l'email */}
        <div
          onClick={handleResendEmail}
          className="w-full  disabled:text-gray-400 mt-12"
        >
          {isResending ? (
            <div className="flex items-center justify-center gap-2">
              <IoReload size={18} className="text-blue-500 animate-spin" />
              <span className="">Invio in corso...</span>
            </div>
          ) : isDisabled ? (
            <div className="h-full w-full bg-gray-400 p-[1px] animated-gradient rounded-lg">
              <ShinyButton
                className="w-full bg-background rounded-lg h-full py-3"
                disabled
              >
                <div className="flex items-center justify-center gap-2">
                  <IoReload
                    size={18}
                    className={isDisabled ? "text-gray-400" : ""}
                  />
                  <p className="font-semibold text-gray-400">{`Riprova tra ${cooldown}`}</p>
                </div>
              </ShinyButton>
            </div>
          ) : (
            <div className="gap-2">
              <div className="text-red-700 mb-2">
                Non hai ricevuto l&apos;email? <br />
              </div>
              <div className="h-full w-full border-gradient p-[1px] animated-gradient rounded-lg">
                <ShinyButton className="w-full bg-background rounded-lg h-full py-3">
                  <div className="flex items-center justify-center gap-2">
                    <IoReload
                      size={18}
                      className={isDisabled ? "text-gray-400" : ""}
                    />
                    <p className="font-semibold">Invia di nuovo l&apos;email</p>
                  </div>
                </ShinyButton>
              </div>
            </div>
          )}
        </div>

        {/* Navigazione */}
        {!isModal && (
          <div className="mt-4 flex flex-col gap-3">
            <Link href="/" className="flex items-center justify-center gap-2">
              <RainbowButton className="py-6">Torna alla home</RainbowButton>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
