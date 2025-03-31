import Link from "next/link";
import React from "react";
import { FiAlertCircle } from "react-icons/fi";

import { RainbowButton } from "@/components/ui/rainbow-button";

import { ErrorViewProps } from "./types";

const ErrorView: React.FC<ErrorViewProps> = ({ error }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md text-center">
      <div className="flex flex-col items-center">
        <FiAlertCircle className="w-20 h-20 text-red-500 mb-8 mt-4" />
        <p className="text-xl text-gray-700 mb-2">Hey Houston, abbiamo un </p>
        <h2 className="text-4xl font-bold text-red-500">Problema 😞</h2>
        <p className="text-xl text-red-700 mt-8">{error.message}</p>
        <div className="mt-8">
          <Link href="/">
            <RainbowButton className="px-4 py-2 mb-6">
              Torna alla home
            </RainbowButton>
          </Link>
        </div>
      </div>
    </div>
  </div>
);

export default ErrorView;
