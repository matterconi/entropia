import React from "react";

const NonAuthorScreen = () => {
  return (
    <div className="flex items-center justify-center min-h-[80vh] w-full p-4">
      <div className="border-gradient w-full max-w-lg p-[1px] animated-gradient rounded-lg">
        <div className="bg-white dark:bg-gray-900 rounded-lg p-8 h-full flex flex-col items-center">
          {/* Illustrazione SVG */}
          <div className="w-64 h-64 mb-6">
            <svg
              viewBox="0 0 500 500"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              {/* Sfondo circolare */}
              <circle
                cx="250"
                cy="250"
                r="200"
                fill="#fff5f5"
                className="dark:fill-slate-800"
              />

              {/* Elementi decorativi */}
              <circle
                cx="250"
                cy="250"
                r="220"
                stroke="#fee2e2"
                strokeWidth="2"
                fill="none"
                className="dark:stroke-slate-700"
                strokeDasharray="15,8"
              />
              <circle
                cx="250"
                cy="250"
                r="180"
                stroke="#fee2e2"
                strokeWidth="2"
                fill="none"
                className="dark:stroke-slate-700"
                strokeDasharray="8,6"
              />

              {/* Documento con penna */}
              <rect
                x="170"
                y="160"
                width="160"
                height="200"
                rx="10"
                fill="#e5e7eb"
                className="dark:fill-slate-600"
              />
              <rect
                x="190"
                y="190"
                width="120"
                height="10"
                rx="2"
                fill="#9ca3af"
                className="dark:fill-slate-400"
              />
              <rect
                x="190"
                y="220"
                width="100"
                height="10"
                rx="2"
                fill="#9ca3af"
                className="dark:fill-slate-400"
              />
              <rect
                x="190"
                y="250"
                width="110"
                height="10"
                rx="2"
                fill="#9ca3af"
                className="dark:fill-slate-400"
              />
              <rect
                x="190"
                y="280"
                width="90"
                height="10"
                rx="2"
                fill="#9ca3af"
                className="dark:fill-slate-400"
              />
              <rect
                x="190"
                y="310"
                width="70"
                height="10"
                rx="2"
                fill="#9ca3af"
                className="dark:fill-slate-400"
              />

              {/* Penna stilizzata */}
              <path
                d="M320,160 L345,135 C350,130 360,130 365,135 L370,140 C375,145 375,155 370,160 L345,185 Z"
                fill="#f43f5e"
                className="dark:fill-rose-600"
              />
              <path
                d="M320,160 L345,185 L320,190 Z"
                fill="#9f1239"
                className="dark:fill-rose-800"
              />

              {/* Simbolo di accesso negato */}
              <circle
                cx="320"
                cy="320"
                r="70"
                fill="#fecaca"
                className="dark:fill-rose-900/30"
              />
              <path
                d="M280,320 L360,320"
                stroke="#ef4444"
                strokeWidth="10"
                strokeLinecap="round"
                className="dark:stroke-rose-500"
              />
              <path
                d="M320,280 L320,360"
                stroke="#ef4444"
                strokeWidth="10"
                strokeLinecap="round"
                className="dark:stroke-rose-500"
                transform="rotate(45 320 320)"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-center mb-4 font-title text-gradient animated-gradient">
            Accesso non consentito
          </h2>

          <p className="text-center text-gray-600 dark:text-gray-400 max-w-sm">
            Per pubblicare contenuti è necessario essere registrati come autore.
            Il tuo account attuale non dispone dei privilegi necessari.
          </p>

          <div className="w-1/2 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent my-6"></div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Se sei interessato a diventare un autore, contatta
            l&apos;amministratore del sito.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NonAuthorScreen;
