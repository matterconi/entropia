"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { IoReload } from "react-icons/io5";
import { MdCheckCircle } from "react-icons/md";

import ResetPasswordForm from "@/components/auth/ResetPasswordForm"; // Form già pronto per inserire la nuova password
import { RainbowButton } from "@/components/ui/rainbow-button";

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  // Possibili stati: "loading", "invalid", "form", "success", "error"
  const [resetStatus, setResetStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const didFetch = useRef(false);

  // Al mount, verifica la validità del token tramite GET
  useEffect(() => {
    if (!token) {
      setResetStatus("invalid");
      setMessage("Token non valido o assente");
      return;
    }
    if (didFetch.current) return;
    didFetch.current = true;
    fetch(`/api/auth/reset-password?token=${token}`, {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setResetStatus("invalid");
          setMessage(data.error);
        } else {
          setResetStatus("form");
        }
      })
      .catch((error) => {
        console.error("Errore durante la verifica del token:", error);
        setResetStatus("error");
        setMessage("Errore durante la verifica del token");
      });
  }, [token]);

  // Callback per il submit del form (POST) che aggiorna la password
  interface PasswordData {
    newPassword: string;
    confirmPassword: string;
  }

  interface ApiResponse {
    error?: string;
  }

  const handlePasswordReset = async (
    passwordData: PasswordData,
  ): Promise<void> => {
    try {
      const res = await fetch(`/api/auth/reset-password?token=${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordData),
      });
      const data: ApiResponse = await res.json();
      if (!res.ok) {
        setResetStatus("error");
        setMessage(data.error || "Errore nel reset della password");
      } else {
        setResetStatus("success");
        setMessage("Password aggiornata con successo!");
      }
    } catch (error) {
      console.error("Errore nel reset password:", error);
      setResetStatus("error");
      setMessage("Errore nel reset della password");
    }
  };

  // UI per lo stato "loading"
  if (resetStatus === "loading") {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-100 text-center">
        <div className="bg-white px-16 rounded-lg shadow-lg border border-gray-200 max-w-md h-full my-16 flex flex-col items-center justify-center min-w-[400px]">
          <IoReload size={24} className="animate-spin text-blue-500" />
          <p className="mt-4 text-lg font-medium">Verifica in corso...</p>
        </div>
      </div>
    );
  }

  // UI per lo stato "invalid" (token non valido)
  if (resetStatus === "invalid") {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-100 text-center">
        <div className="bg-white px-16 rounded-lg shadow-lg border border-gray-200 max-w-md h-full my-16 flex flex-col items-center justify-center min-w-[400px]">
          <FiAlertCircle className="w-20 h-20 text-red-500 mb-4" />
          <h2 className="text-4xl font-bold text-red-500">Token non valido</h2>
          <p className="text-base text-gray-700 mt-4">{message}</p>
          <Link href="/">
            <RainbowButton className="mt-6">Torna alla Home</RainbowButton>
          </Link>
        </div>
      </div>
    );
  }

  // UI per lo stato "error" (errore durante il reset)
  if (resetStatus === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-100 text-center">
        <div className="bg-white px-16 rounded-lg shadow-lg border border-gray-200 max-w-md h-full my-16 flex flex-col items-center justify-center min-w-[400px]">
          <FiAlertCircle className="w-20 h-20 text-red-500 mb-4" />
          <h2 className="text-4xl font-bold text-red-500">Errore</h2>
          <p className="text-base text-gray-700 mt-4">{message}</p>
          <Link href="/">
            <RainbowButton className="mt-6">Torna alla Home</RainbowButton>
          </Link>
        </div>
      </div>
    );
  }

  // UI per lo stato "success" (password aggiornata)
  if (resetStatus === "success") {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-100 text-center">
        <div className="bg-white px-16 rounded-lg shadow-lg border border-gray-200 max-w-md h-full my-16 flex flex-col items-center justify-center min-w-[400px]">
          <MdCheckCircle className="w-20 h-20 text-green-500 mb-4" />
          <h2 className="text-4xl font-bold text-green-500">Successo!</h2>
          <p className="text-base text-gray-700 mt-4">{message}</p>
          <Link href="/">
            <RainbowButton className="mt-6">Torna alla Home</RainbowButton>
          </Link>
        </div>
      </div>
    );
  }

  // UI per lo stato "form": il token è valido, mostra il form per cambiare la password
  return (
    <div className="flex flex-col items-center justify-center h-fit bg-gray-100 text-center">
      <ResetPasswordForm
        onSubmit={handlePasswordReset}
        defaultValues={{ newPassword: "", confirmPassword: "" }}
      />
    </div>
  );
}
