"use client";

import Link from "next/link";
import React from "react";

// Interfaccia aggiornata per la TagItem
interface TagItem {
  label?: string;
  name?: string;
  type?: string;
  id?: string;
  relevance?: number;
}

interface TagProps {
  tag: TagItem;
  onClick?: () => void;
}

/**
 * Tag - Componente che visualizza un singolo tag, con supporto per link
 *
 * @param tag - Dati del tag da visualizzare
 * @param onClick - Handler opzionale per il click sul tag
 */
const Tag: React.FC<TagProps> = ({ tag, onClick }) => {
  // Ottieni l'etichetta da visualizzare (supporta sia label che name)
  const rawLabel = tag.label || tag.name || "Tag";

  // Capitalizza la prima lettera dell'etichetta
  const displayLabel = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);

  // Determina il tipo del tag per lo stile
  const tagType = tag.type || "generic";

  // Determina se è un tag speciale (hot o new)
  const isSpecialTag =
    tagType.toLowerCase() === "hot" || tagType.toLowerCase() === "new";

  // Ottieni i colori per il tag in base al tipo
  const getTagStyles = () => {
    switch (tagType.toLowerCase()) {
      case "categorie":
      case "category":
        return "from-blue-600 to-blue-500 bg-blue-500";
      case "generi":
      case "genre":
        return "from-purple-600 to-purple-500 bg-purple-500";
      case "topic":
      case "topics":
        return "from-yellow-500 to-amber-500 bg-yellow-500";
      case "collection":
        return "from-orange-600 to-orange-500 bg-orange-500";
      default:
        return "from-gray-600 to-gray-500 bg-gray-500";
    }
  };

  const tagBackgroundGradient = getTagStyles();

  // Crea l'URL del link
  const createLinkHref = () => {
    // Usa il nome del type normalizzato per l'URL
    const typeForUrl = tagType.toLowerCase();
    // Usa il nome visualizzato del tag per il segmento finale dell'URL
    const labelForUrl = rawLabel.toLowerCase();

    return `/${typeForUrl}/${labelForUrl}`;
  };

  const linkHref = createLinkHref();

  // Design speciale per tag "hot"
  if (tagType.toLowerCase() === "hot") {
    return (
      <div className="w-fit relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-orange-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
        <div className="relative flex items-center bg-red-500 text-white px-3 py-1.5 rounded-lg font-bold text-xs tracking-wider">
          Hot
        </div>
      </div>
    );
  }

  // Design speciale per "new"
  if (tagType.toLowerCase() === "new") {
    return (
      <div className="w-fit relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-400 rounded-lg blur transition duration-200"></div>
        <div className="relative flex items-center bg-green-500 text-white px-2 md:px-3 py-1.5 md:py-2 rounded-lg font-semibold text-xs tracking-wider font-title">
          Novità
        </div>
      </div>
    );
  }

  // Design per tag standard con sfumatura mantenendo i colori originali
  const tagContent = (
    <div className="w-fit relative group">
      <div
        className={`absolute -inset-0.5 bg-gradient-to-r ${tagBackgroundGradient} rounded-lg blur opacity-50 group-hover:opacity-70 transition duration-200`}
      ></div>
      <div
        className={`relative bg-gradient-to-r ${tagBackgroundGradient} text-white px-2 py-1.5 rounded-lg text-xs font-medium`}
      >
        {displayLabel}
      </div>
    </div>
  );

  return (
    <div className="flex items-center justify-end mr-2 mt-0 w-fit">
      {/* Se non è "hot" o "new", rendilo un link */}
      {!isSpecialTag ? (
        <Link href={linkHref}>{tagContent}</Link>
      ) : (
        // Se il tipo è "hot" o "new", è gestito sopra e non dovrebbe arrivare qui
        tagContent
      )}
    </div>
  );
};

export default Tag;
