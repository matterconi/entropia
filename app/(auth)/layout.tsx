import "../globals.css";

import Script from "next/script";
import React from "react";

import Navbar from "@/components/navigation/Navbar";
import Providers from "@/context/Providers";

import MiniNavbar from "./MiniNavbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Versia</title>
        {/* Correggi eventuali errori nel meta tag */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Carica lo script di Google in modalità afterInteractive */}
        <Script
          src="https://apis.google.com/js/platform.js"
          strategy="afterInteractive"
          async
          defer
        />
      </head>
      <body className="bg-background text-foreground antialiased max-w-4xl flex flex-col mx-auto min-h-screen bg-gray-100 dark:bg-gray-900">
        <Providers>
          <MiniNavbar />
          <main className="container mx-auto p-4 flex flex-col h-full flex-1 justify-center">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
