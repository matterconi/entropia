// File: VerificationCodeInput.tsx
"use client";

import React, { useEffect, useRef } from "react";

interface VerificationCodeInputProps {
  verificationCode: string[];
  setVerificationCode: (code: string[]) => void;
}

export function VerificationCodeInput({
  verificationCode,
  setVerificationCode,
}: VerificationCodeInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Inizializza i riferimenti per ogni input
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 4);
  }, []);

  // Gestione dell'input del codice
  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0]; // Prendi solo il primo carattere se l'utente incolla più caratteri
    }

    // Aggiorna il codice
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Sposta il focus all'input successivo
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Gestione del tasto Backspace
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      // Sposta il focus all'input precedente quando si preme backspace su un campo vuoto
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-2 mt-6">
      {verificationCode.map((digit, index) => (
        <input
          key={index}
          type="text"
          maxLength={1}
          value={digit}
          onChange={(e) => handleCodeChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          className="w-12 h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
        />
      ))}
    </div>
  );
}
