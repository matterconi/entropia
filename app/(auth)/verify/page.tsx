"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import React, { useEffect, useRef, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";
import { RiErrorWarningLine } from "react-icons/ri";

import FlickeringGrid from "@/components/ui/flickering-grid";
import { RainbowButton } from "@/components/ui/rainbow-button";

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const router = useRouter();
  const [localStatus, setLocalStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const didFetch = useRef(false);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  // Set dimensions on client side
  useEffect(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  useEffect(() => {
    if (didFetch.current) return;
    if (!token) {
      setLocalStatus("error");
      setMessage("Il tuo token di verifica è mancante oppure non è valido");
      return;
    }
    didFetch.current = true;

    async function verifyAccount() {
      try {
        const verifyResponse = await fetch("/api/auth/complete-registration", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, email }),
        });

        const verifyData = await verifyResponse.json();

        if (!verifyResponse.ok || !verifyData.success) {
          setLocalStatus("error");
          setMessage(verifyData.error || "Errore durante la verifica");
          return;
        }

        if (verifyData.token) {
          const signInResult = await signIn("credentials", {
            token: verifyData.token,
            redirect: false,
          });

          if (signInResult?.error) {
            setLocalStatus("error");
            setMessage(
              "Errore durante l'autenticazione: " + signInResult.error,
            );
          } else {
            setLocalStatus("success");
            setMessage("Verifica completata con successo!");

            setTimeout(() => {
              router.push("/");
            }, 3000);
          }
        } else {
          setLocalStatus("error");
          setMessage("Token di autenticazione mancante nella risposta");
        }
      } catch (error) {
        setLocalStatus("error");
        setMessage("Si è verificato un errore durante la verifica");
      }
    }

    verifyAccount();
  }, [token, email, router]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center">
      {/* Flickering grid background - stile Versia */}
      <FlickeringGrid
        className="z-0 absolute inset-0 [mask-image:radial-gradient(600px_circle_at_center,white,transparent)] w-full"
        squareSize={4}
        gridGap={6}
        color="#60A5FA"
        maxOpacity={0.5}
        flickerChance={0.1}
        height={dimensions.height}
        width={dimensions.width}
      />

      {/* Title in stile Versia */}
      <h1 className="text-gradient font-title text-6xl md:text-7xl p-8 text-center mt-16 mb-8 font-semibold z-10">
        {localStatus === "loading"
          ? "Verifica"
          : localStatus === "success"
            ? "Evvai!"
            : "Ops!"}
      </h1>

      {/* Contenuto principale */}
      <div className="border-gradient p-[1px] rounded-lg w-full max-w-2xl flex flex-col items-center justify-center z-10">
        <div className="z-10 w-full h-auto py-16 bg-background rounded-lg px-4 max-md:px-8">
          {localStatus === "loading" && (
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 flex items-center justify-center mb-8">
                <div className="absolute inset-0 bg-blue-500 opacity-20 rounded-full animate-pulse"></div>
                <div className="relative border-4 border-blue-500 border-t-transparent rounded-full w-20 h-20 animate-spin"></div>
                <IoMdMail className="absolute text-blue-500 text-4xl" />
              </div>

              <h2 className="text-4xl font-title text-foreground text-center mb-4">
                Stiamo verificando la tua
                <span className="text-gradient"> email</span>
              </h2>

              <p className="text-center text-muted-foreground max-w-lg mb-8">
                Questo processo richiede solo pochi secondi, grazie per la
                pazienza.
              </p>

              <div className="h-14 flex items-center justify-center mt-8">
                <div className="w-8 h-8 border-4 border-blue-400 border-t-blue-200 rounded-full animate-spin"></div>
              </div>

              <p className="text-sm text-muted-foreground mt-4">
                La verifica è automatica, non è necessario fare nulla...
              </p>
            </div>
          )}

          {localStatus === "error" && (
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 flex items-center justify-center mb-8">
                <div className="absolute inset-0 bg-red-500 opacity-20 rounded-full animate-pulse"></div>
                <RiErrorWarningLine className="text-6xl text-red-500" />
              </div>

              <h2 className="text-4xl font-title text-foreground mb-4">
                Qualcosa è andato <span className="text-gradient">storto</span>
              </h2>

              <p className="text-center text-red-700 max-w-lg px-4 py-2 bg-red-100 rounded-lg ">
                {message}
              </p>

              <Link href="/sign-up" className="mt-12">
                <RainbowButton className="w-fit p-4 px-6">
                  <p className="font-semibold">Torna alla home</p>
                </RainbowButton>
              </Link>

              <p className="text-sm text-muted-foreground mt-4">
                Prova a effettuare una nuova registrazione o contattaci per
                supporto.
              </p>
            </div>
          )}

          {localStatus === "success" && (
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 flex items-center justify-center mb-8">
                <div className="absolute inset-0 bg-green-500 opacity-20 rounded-full animate-pulse"></div>
                <FaCheckCircle className="text-6xl text-green-500" />
              </div>

              <h2 className="text-4xl font-title text-foreground text-center mb-4">
                Benvenuto in <span className="text-gradient">Versia</span>
              </h2>

              <p className="text-center text-muted-foreground max-w-lg mb-8">
                La tua email è stata verificata con successo! Sei pronto per
                iniziare.
              </p>

              <Link href="/" className="mt-8">
                <RainbowButton className="w-fit p-4 px-6">
                  <p className="font-semibold text-gradient">
                    Inizia l&apos;esperienza
                  </p>
                </RainbowButton>
              </Link>

              <p className="text-sm text-muted-foreground mt-4">
                Sarai reindirizzato automaticamente tra pochi secondi...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
