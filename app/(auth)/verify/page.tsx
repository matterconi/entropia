"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import React, { useEffect, useRef, useState } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { IoReload } from "react-icons/io5";
import { MdMarkEmailRead } from "react-icons/md";

import { RainbowButton } from "@/components/ui/rainbow-button";
import { ShinyButton } from "@/components/ui/shiny-button";

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const [localStatus, setLocalStatus] = useState("loading");
  const [message, setMessage] = useState("");
  // useRef per assicurare che la chiamata sia eseguita una sola volta
  const didFetch = useRef(false);

  useEffect(() => {
    console.log("DEBUG: In VerifyEmail useEffect, token:", token);
    if (didFetch.current) {
      console.log("DEBUG: Chiamata già eseguita, non rifarla");
      return;
    }
    if (!token) {
      setLocalStatus("error");
      setMessage("Token non valido o assente");
      return;
    }
    didFetch.current = true; // Segna che la chiamata è stata eseguita

    console.log("DEBUG: Chiamo l'endpoint di verifica con token:", token);
    fetch(`/api/auth/verify-email?token=${token}`)
      .then((res) => res.json())
      .then(async (data) => {
        console.log("DEBUG: Risposta dall'endpoint di verifica:", data);
        if (data.error) {
          setLocalStatus("error");
          setMessage(data.error);
        } else if (data.token) {
          // Usa il token restituito per aggiornare la sessione via signIn
          const result = await signIn("credentials", {
            token: data.token,
            redirect: false,
          });
          console.log("DEBUG: Risultato di signIn:", result);
          if (result?.error) {
            setLocalStatus("error");
            setMessage(result.error);
          } else {
            setLocalStatus("success");
            setMessage("Verifica completata!");
            // Reindirizza alla dashboard dopo 2 secondi
          }
        }
      })
      .catch((error) => {
        console.error("DEBUG: Errore durante la fetch:", error);
        setLocalStatus("error");
        setMessage(error.message);
      });
  }, [token, router]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-100 text-center">
      <div className="bg-white px-16 rounded-lg shadow-lg border border-gray-200 max-w-md h-full my-16 flex flex-col items-center justify-center min-w-[400px]">
        {localStatus === "loading" && (
          <div className="flex flex-col items-center gap-2 text-blue-500">
            <IoReload size={24} className="animate-spin" />
            <p className="text-lg font-medium">Verifica in corso...</p>
          </div>
        )}

        {localStatus === "error" && (
          <div className="text-center p-4">
            <div className="flex flex-col items-center">
              <FiAlertCircle className="w-20 h-20 text-red-500 mb-4" />
              <h2 className="text-4xl font-bold text-red-500">Errore</h2>
              <p className="text-base text-gray-700 mt-12 ">{message}</p>
              <Link href="/">
                <RainbowButton className="mt-6">Torna alla home</RainbowButton>
              </Link>
            </div>
          </div>
        )}

        {localStatus === "success" && (
          <>
            <div className="flex items-center justify-center w-20 h-20 mx-auto bg-green-100 text-green-600 rounded-full shadow-lg mb-4">
              <MdMarkEmailRead size={50} />
            </div>
            <h2 className="text-3xl font-bold text-green-600">
              🎉 Verifica completata!
            </h2>
            <p className="text-lg text-gray-700 mt-12">
              Il tuo account è stato verificato e sei autenticato.
            </p>
            <Link href="/">
              <RainbowButton className="mt-4">Torna alla home</RainbowButton>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
