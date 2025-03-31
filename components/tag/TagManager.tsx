"use client";

import React, { useState } from "react";

import Tag from "@/components/tag/Tag";

// Interfaccia aggiornata per supportare sia il formato semplice che quello con priorità
interface TagItem {
  label?: string;
  name?: string; // Per supportare il nuovo formato con name invece di label
  type?: string;
  id?: string;
  relevance?: number;
}

interface TagManagerProps {
  tags: TagItem[];
  maxPerCategory?: number;
  showMoreLabel?: string;
  sortByRelevance?: boolean; // Prop per abilitare l'ordinamento per rilevanza
  isRelated?: boolean; // Nuova prop per la visualizzazione ridotta in modalità "related"
}

/**
 * TagManager - Componente riutilizzabile per gestire e visualizzare tag con funzionalità di espansione
 *
 * @param tags - Array di tag da visualizzare (supporta sia formato base che con priorità)
 * @param maxPerCategory - Numero massimo di tag da mostrare per categoria quando non espanso (default: 2)
 * @param showMoreLabel - Testo per il contatore "mostra più tag" (default: "+")
 * @param sortByRelevance - Se true, ordina i tag per rilevanza all'interno di ogni tipo (default: false)
 * @param isRelated - Se true, mostra solo i 3 tag più rilevanti (uno per category, genre e topic)
 */
const TagManager: React.FC<TagManagerProps> = ({
  tags,
  maxPerCategory = 2,
  showMoreLabel = "+",
  sortByRelevance = false,
  isRelated = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Filtra i tag "non-classificato"
  const filteredTags = tags.filter((tag) => {
    const tagLabel = tag.label || tag.name || "";
    return tagLabel.toLowerCase() !== "non-classificato";
  });

  // Funzione per preparare e ordinare gli array di tag per ciascun tipo prioritario
  const prepareTagArrays = () => {
    // Array per i tipi prioritari
    const categoryTags: TagItem[] = [];
    const genreTags: TagItem[] = [];
    const topicTags: TagItem[] = [];
    const otherTags: TagItem[] = []; // Per tutti gli altri tipi

    // Distribuisci i tag nei rispettivi array
    filteredTags.forEach((tag) => {
      if (tag.type === "categorie") {
        categoryTags.push(tag);
      } else if (tag.type === "generi") {
        genreTags.push(tag);
      } else if (tag.type === "topic") {
        topicTags.push(tag);
      } else {
        otherTags.push(tag);
      }
    });

    // Funzione per ordinare gli array per relevance (valori più bassi prima)
    const sortByRelevance = (tags: TagItem[]) => {
      return [...tags].sort((a, b) => {
        const relevanceA =
          a.relevance !== undefined ? a.relevance : Number.MAX_SAFE_INTEGER;
        const relevanceB =
          b.relevance !== undefined ? b.relevance : Number.MAX_SAFE_INTEGER;
        return relevanceA - relevanceB; // 1 è più rilevante di 2
      });
    };

    // Ordina tutti gli array per relevance
    const sortedCategoryTags = sortByRelevance(categoryTags);
    const sortedGenreTags = sortByRelevance(genreTags);
    const sortedTopicTags = sortByRelevance(topicTags);
    const sortedOtherTags = sortByRelevance(otherTags);

    return {
      categoryTags: sortedCategoryTags,
      genreTags: sortedGenreTags,
      topicTags: sortedTopicTags,
      otherTags: sortedOtherTags,
    };
  };

  // Ottieni gli array ordinati
  const { categoryTags, genreTags, topicTags, otherTags } = prepareTagArrays();

  // Determina quali tag mostrare in base allo stato di espansione
  const getVisibleTags = () => {
    let visibleTags: TagItem[] = [];
    let hiddenCount = 0;

    if (isExpanded) {
      // Se espanso, mostra tutti i tag
      visibleTags = [...categoryTags, ...genreTags, ...topicTags, ...otherTags];
      hiddenCount = 0;
    } else if (isRelated) {
      // Mostra almeno 3 tag totali se disponibili, prioritizzando una per tipo
      let remainingSlots = 3;
      let categoryUsed = 0;
      let genreUsed = 0;
      let topicUsed = 0;

      // Prima aggiungi un tag per ciascuna categoria principale se disponibile
      if (categoryTags.length > 0) {
        visibleTags.push(categoryTags[0]);
        categoryUsed = 1;
        remainingSlots--;
      }

      if (genreTags.length > 0 && remainingSlots > 0) {
        visibleTags.push(genreTags[0]);
        genreUsed = 1;
        remainingSlots--;
      }

      if (topicTags.length > 0 && remainingSlots > 0) {
        visibleTags.push(topicTags[0]);
        topicUsed = 1;
        remainingSlots--;
      }

      // Se non abbiamo ancora 3 tag, riempi con altre tag disponibili in ordine di priorità
      // Aggiungi più tag dalla categoria
      while (remainingSlots > 0 && categoryUsed < categoryTags.length) {
        visibleTags.push(categoryTags[categoryUsed]);
        categoryUsed++;
        remainingSlots--;
      }

      // Aggiungi più tag dai generi
      while (remainingSlots > 0 && genreUsed < genreTags.length) {
        visibleTags.push(genreTags[genreUsed]);
        genreUsed++;
        remainingSlots--;
      }

      // Aggiungi più tag dai topic
      while (remainingSlots > 0 && topicUsed < topicTags.length) {
        visibleTags.push(topicTags[topicUsed]);
        topicUsed++;
        remainingSlots--;
      }

      // Aggiungi altre tag se necessario per arrivare a 3
      let otherUsed = 0;
      while (remainingSlots > 0 && otherUsed < otherTags.length) {
        visibleTags.push(otherTags[otherUsed]);
        otherUsed++;
        remainingSlots--;
      }

      // Calcola quante tag sono nascoste
      hiddenCount =
        categoryTags.length -
        categoryUsed +
        (genreTags.length - genreUsed) +
        (topicTags.length - topicUsed) +
        (otherTags.length - otherUsed);
    } else {
      // Comportamento standard non espanso: mostra maxPerCategory per tipo
      if (categoryTags.length > 0) {
        visibleTags = visibleTags.concat(categoryTags.slice(0, maxPerCategory));
        hiddenCount += Math.max(0, categoryTags.length - maxPerCategory);
      }

      if (genreTags.length > 0) {
        visibleTags = visibleTags.concat(genreTags.slice(0, maxPerCategory));
        hiddenCount += Math.max(0, genreTags.length - maxPerCategory);
      }

      if (topicTags.length > 0) {
        visibleTags = visibleTags.concat(topicTags.slice(0, maxPerCategory));
        hiddenCount += Math.max(0, topicTags.length - maxPerCategory);
      }

      if (otherTags.length > 0) {
        visibleTags = visibleTags.concat(otherTags.slice(0, maxPerCategory));
        hiddenCount += Math.max(0, otherTags.length - maxPerCategory);
      }
    }

    return { visibleTags, hiddenCount };
  };

  const { visibleTags, hiddenCount } = getVisibleTags();

  // Funzione per espandere le tag
  const expandTags = () => {
    setIsExpanded(true);
  };

  return (
    <div className="flex flex-wrap gap-3 items-start justify-start transition-all duration-300">
      {visibleTags.map((tag, i) => (
        <Tag key={`${tag.type}-${tag.label || tag.name}-${i}`} tag={tag} />
      ))}

      {/* Contatore "Mostra più" */}
      {!isExpanded && hiddenCount > 0 && (
        <div className="w-fit relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-600 to-gray-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
          <div className="relative flex items-center bg-gray-500 text-white px-3 py-1.5 rounded-lg text-xs tracking-wider" onClick={expandTags}>
            {showMoreLabel}
            {hiddenCount}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagManager;
