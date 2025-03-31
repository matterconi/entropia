"use client";

import React from "react";
import { IoReload } from "react-icons/io5";

export function LoadingState() {
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
