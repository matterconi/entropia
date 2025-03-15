import { AlertCircle, BookOpen, Search } from "lucide-react";
import React from "react";

interface NoArticlesScreenProps {
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
}

const NoArticlesScreen: React.FC<NoArticlesScreenProps> = ({
  title = "Nessun articolo trovato",
  message = "Non ci sono articoli disponibili al momento.",
  actionText = "",
  onAction = null,
}) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh] w-full p-4">
      <div className="w-full max-w-lg p-8 bg-background rounded-lg  text-center">
        {/* Icona centrale con dimensioni responsive */}
        <div className="flex justify-center mb-8">
          <div className="relative w-72 h-72">
            {/* Icone decorative - posizionate prima nel DOM ma sotto per z-index */}
            <div className="absolute -right-4 -top-2 max-md:top-4 max-md:right-2 z-10">
              <div className="size-24 sm:size-28 md:size-32 bg-yellow-50 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                <BookOpen
                  className="text-yellow-500 dark:text-yellow-400 size-12 sm:size-14 md:size-16"
                  strokeWidth={1.5}
                />
              </div>
            </div>
            <div className="absolute -left-4 -bottom-2 max-md:bottom-8 max-md:left-2 z-10">
              <div className="size-20 sm:size-24 md:size-28 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <AlertCircle
                  className="text-red-500 dark:text-red-400 size-10 sm:size-12 md:size-14"
                  strokeWidth={1.5}
                />
              </div>
            </div>

            {/* Cerchio di sfondo principale - posizionato dopo nel DOM per essere sopra */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 size-48 sm:size-56 md:size-64 lg:size-72 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center ">
              <Search
                className="text-orange-500 dark:text-orange-400 size-24 sm:size-32 md:size-40 lg:size-44"
                strokeWidth={1.5}
              />
            </div>
          </div>
        </div>

        {/* Titolo */}
        <h2 className="mt-12 text-2xl md:text-3xl font-bold mb-4 text-gradient font-title">
          {title}
        </h2>

        {/* Messaggio */}
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          {message}
        </p>

        {/* Pulsante azione */}
        {actionText && onAction && (
          <button
            onClick={onAction}
            className="px-6 py-3 text-lg rounded-md bg-orange-600 hover:bg-orange-700 text-white font-medium transition-colors"
          >
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
};

export default NoArticlesScreen;
