import React from "react";

const UserNotFoundScreen = () => {
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
                fill="#f0f4ff"
                className="dark:fill-slate-800"
              />

              {/* Silhouette persona */}
              <path
                d="M250,140 C290,140 320,170 320,210 C320,250 290,280 250,280 C210,280 180,250 180,210 C180,170 210,140 250,140 Z"
                fill="#d1d5db"
                className="dark:fill-slate-600"
              />
              <path
                d="M355,390 C355,330 310,280 250,280 C190,280 145,330 145,390 L355,390 Z"
                fill="#d1d5db"
                className="dark:fill-slate-600"
              />

              {/* Punto interrogativo */}
              <text
                x="250"
                y="230"
                fontSize="120"
                fontWeight="bold"
                textAnchor="middle"
                fill="#6366f1"
                className="dark:fill-indigo-400"
              >
                ?
              </text>

              {/* Linee decorative circolari */}
              <circle
                cx="250"
                cy="250"
                r="220"
                stroke="#e0e7ff"
                strokeWidth="2"
                fill="none"
                className="dark:stroke-slate-700"
                strokeDasharray="15,8"
              />
              <circle
                cx="250"
                cy="250"
                r="180"
                stroke="#e0e7ff"
                strokeWidth="2"
                fill="none"
                className="dark:stroke-slate-700"
                strokeDasharray="8,6"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-center mb-4 font-title text-gradient animated-gradient">
            Utente non trovato
          </h2>

          <p className="text-center text-gray-600 dark:text-gray-400 max-w-sm">
            Non riusciamo a trovare l&apos;utente richiesto nel nostro sistema.
            L&apos;account potrebbe essere stato rimosso o l&apos;URL potrebbe
            non essere corretto.
          </p>

          <div className="w-1/2 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent my-6"></div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Puoi utilizzare la barra di navigazione per tornare alla home.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserNotFoundScreen;
