import { redirect } from "next/navigation";
import React from "react";

import User from "@/database/User";
import dbConnect from "@/lib/mongoose";

interface VerifyEmailProps {
  searchParams?: Record<string, string | undefined>;
}

export default async function VerifyEmail({ searchParams }: VerifyEmailProps) {
  const token = searchParams?.token;

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-500">
            ❌ Token non valido
          </h2>
          <p>Il link di verifica non è valido o è mancante.</p>
        </div>
      </div>
    );
  }

  await dbConnect();
  const user = await User.findOne({ verificationToken: token });

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-500">
            ❌ Token non valido o già usato
          </h2>
          <p>Il link potrebbe essere scaduto o già utilizzato.</p>
        </div>
      </div>
    );
  }

  // Se l'utente è già verificato
  if (user.isVerified) {
    return redirect("/sign-in?verified=true");
  }

  // ✅ Verifica l'utente e rimuove il token
  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();

  // ✅ Mostriamo una pagina di successo per 5 secondi prima del redirect
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 text-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-green-600">
          🎉 Verifica completata!
        </h2>
        <p className="text-lg text-gray-700 mt-2">
          Il tuo account è stato verificato con successo.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Verrai reindirizzato automaticamente...
        </p>
        <a
          href="/sign-in?verified=true"
          className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
        >
          🔑 Accedi ora
        </a>
      </div>
      {/* Redirect automatico dopo 5 secondi */}
      <meta httpEquiv="refresh" content="5;url=/sign-in?verified=true" />
    </div>
  );
}
