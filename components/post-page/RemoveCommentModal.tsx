"use client";

import React, { useEffect } from "react";
import { IoClose } from "react-icons/io5";

interface RemoveCommentModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void; // Lo state management lo gestisci tu, ma qui lo chiamiamo per segnalare la chiusura
}

const RemoveCommentModal: React.FC<RemoveCommentModalProps> = ({
  isOpen,
  onConfirm,
  onClose,
}) => {
  // Definisci la funzione di chiusura interna, che verrà usata in entrambi i casi:
  // clic sull'overlay o sul bottone della croce
  const handleClose = () => {
    onClose();
  };

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay: cliccando qui chiude il modal */}
      <div
        className="absolute inset-0 bg-black opacity-30"
        onClick={handleClose}
      ></div>
      {/* Contenuto del modal: non copre tutto lo schermo */}
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-foreground">
            Conferma Eliminazione
          </h2>
          <button onClick={handleClose}>
            <IoClose className="h-6 w-6 text-gray-500 hover:text-gray-700 transition-colors" />
          </button>
        </div>
        <p className="mb-6 text-sm text-foreground">
          Sei sicuro di voler eliminare questo commento? L'azione non potrà essere
          annullata.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm text-gray-600 rounded hover:bg-gray-200 transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
          >
            Elimina
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveCommentModal;
