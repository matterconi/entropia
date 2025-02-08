import Link from "next/link"; // Importa il componente Link di Next.js
import React from "react";

const Tag = ({ tag }: { tag: { label: string; type: string } }) => {
  // Determina la classe di colore in base al tipo di tag
  const colorClass =
    tag.type === "categorie"
      ? "bg-blue-500"
      : tag.type === "generi"
        ? "bg-purple-500"
        : tag.type === "topic"
          ? "bg-yellow-500"
          : tag.type === "new"
            ? "bg-green-500"
            : tag.type === "hot"
              ? "bg-red-500"
              : "bg-gray-500"; // Colore di default per tipi non definiti

  // Crea l'URL del link
  const linkHref = `/${tag.type.toLowerCase()}/${tag.label.toLowerCase()}`;

  return (
    <div className="flex items-center justify-end mr-2 mt-0 w-fit">
      {/* Se il tipo non è "hot" o "new", rendilo un link */}
      {tag.type !== "hot" && tag.type !== "new" ? (
        <Link href={linkHref}>
          <div
            className={`${colorClass} font-sans text-white text-xs px-3 py-2 rounded-full cursor-pointer`}
          >
            {tag.label}
          </div>
        </Link>
      ) : (
        // Se il tipo è "hot" o "new", rendilo solo un elemento non cliccabile
        <div
          className={`${colorClass} font-sans text-white text-xs px-3 py-2 rounded-full`}
        >
          {tag.label}
        </div>
      )}
    </div>
  );
};

export default Tag;
