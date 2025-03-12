"use client";

import React, { useEffect, useState } from "react";
import { IoClose, IoCloseSharp, IoReload } from "react-icons/io5";
import { MdErrorOutline, MdMarkEmailRead } from "react-icons/md";
import { RainbowButton } from "../ui/rainbow-button";
import Link from "next/link";
import { useSignModal } from "@/context/SignModalContext";
import { User } from "@/types";

interface RemoveCommentModalProps {
  isOpen: boolean;
  isLogged: boolean;
  onClose: () => void;
  user: User | null;
}

const RemoveCommentModal: React.FC<RemoveCommentModalProps> = ({
  isOpen,
  isLogged,
  onClose,
  user,
}) => {
  const handleClose = () => {
    onClose();
  };
  const [message, setMessage] = useState<string | null>(null);
  const [mailSent, setMailSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(false);
  const { openModal } = useSignModal();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleResendEmail = async () => {
    if (!user?.email) return;
    if (cooldown > 0) return;
    setIsSending(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/resend-verification-mail", {
        method: "POST",
        body: JSON.stringify({ email: user?.email }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Email di verifica inviata con successo!");
        setCooldown(60);
      } else {
        setError(true);
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setError(true);
      setMessage("❌ Errore nell'invio della mail.");
    } finally {
      setIsSending(false);
      setMailSent(true);
    }
  };

  const isDisabled = mailSent || cooldown > 0;

  console.log(mailSent);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-30"
        onClick={handleClose}
      ></div>
      <div className="z-50">
      {!mailSent ? (
        <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-foreground flex items-center">
            <MdErrorOutline className="h-6 w-6 text-red-500 mr-2" />
            {isLogged ? "Utente non verificato" : "Accesso richiesto"}
          </h2>
          <button onClick={handleClose}>
            <IoClose className="h-6 w-6 text-gray-500 hover:text-gray-700 transition-colors" />
          </button>
        </div>
        {isLogged ? (
          <p className="mb-6 text-sm text-foreground">
            La tua mail non è stata verificata. Per favore, controlla la tua casella di posta elettronica e conferma la tua registrazione. Se non hai ricevuto la mail, premi il pulsante qui sotto per inviarne un'altra.
          </p>
        ) : (
          <p className="mb-6 text-sm text-foreground">
            Per continuare, effettua l'accesso o registrati.
          </p>
        )}
        <div className="flex justify-end space-x-4">
          {isLogged ? (
            !isSending ? (
                <RainbowButton onClick={handleResendEmail}>
                Invia mail di verifica
                </RainbowButton>
            ) : (
                <div className="flex items-center justify-center gap-2">
                    <IoReload size={18} className="text-blue-500 animate-spin" />
                    <span className="">Invio in corso...</span>
                </div>
            )
          ) : (
            <>
                <Link className="xl:hidden w-full" href="/sign-up">
                    <RainbowButton>
                        Accedi / Registrati
                    </RainbowButton>
                </Link>
                <div className="max-xl:hidden w-full">
                    <RainbowButton onClick={() => {
                        onClose();
                        openModal("signUp");
                    }}>
                        Accedi / Registrati
                    </RainbowButton>
                </div>
            </>
          )}
        </div>
      </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200 max-w-md">
        <IoCloseSharp onClick={onClose} className="text-foreground cursor-pointer size-8" />

        {error ? (
          <>
            {/* Interfaccia in caso di errore */}
            <div className="flex items-center justify-center w-20 h-20 mx-auto bg-red-100 text-red-600 rounded-full shadow-lg mb-4">
              <MdErrorOutline size={50} />
            </div>
            <h2 className="text-3xl font-bold text-red-700 font-title mb-4 text-center">
              Errore durante l'invio!
            </h2>
            <p className="text-gray-700 mt-2">
              {message || 'Si è verificato un errore. Riprova più tardi.'}
            </p>
          </>
        ) : (
          <>
            {/* Interfaccia in caso di successo */}
            <div className="flex items-center justify-center w-20 h-20 mx-auto bg-green-100 text-green-600 rounded-full shadow-lg mb-4">
              <MdMarkEmailRead size={50} />
            </div>
            <h2 className="text-3xl font-bold text-green-700 font-title mb-4 mt-2 text-center">
              Mail inviata!
            </h2>
          </>
        )}

        {/* Mostra eventuali dettagli aggiuntivi se presenti */}
        {message && (
          <p
            className={`my-4 p-2 rounded-lg ${
              error ? "text-red-700 bg-red-100" : "text-green-700 bg-green-100"
            }`}
          >
            {message} {user?.email && <strong>{user.email}</strong>}
          </p>
        )}

        {/* Pulsante per inviare di nuovo l'email */}
        <div onClick={handleResendEmail} className="w-full disabled:text-gray-400 mt-12">
          {isSending ? (
            <div className="flex items-center justify-center gap-2">
              <IoReload size={18} className="text-blue-500 animate-spin" />
              <span>Invio in corso...</span>
            </div>
          ) : isDisabled ? (
            <div className="h-full w-full bg-gray-400 p-[1px] animated-gradient rounded-lg">
              <RainbowButton className="w-full bg-background rounded-lg h-full py-3" disabled>
                <div className="flex items-center justify-center gap-2">
                  <IoReload size={18} className="text-gray-400" />
                  <p className="font-semibold text-gray-400">{`Riprova tra ${cooldown}`}</p>
                </div>
              </RainbowButton>
            </div>
          ) : (
            <div className="gap-2">
              <div className="text-red-700 mb-2">
                Non hai ricevuto l'email? <br />
              </div>
              <div className="h-full w-full border-gradient p-[1px] animated-gradient rounded-lg">
                <RainbowButton className="w-full bg-background rounded-lg h-full py-3">
                  <div className="flex items-center justify-center gap-2">
                    <IoReload size={18} />
                    <p className="font-semibold">Invia di nuovo l'email</p>
                  </div>
                </RainbowButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
        )}
      </div>
    </div>
  );
};

export default RemoveCommentModal;
