"use client";

import React from "react";
import { UseFormSetValue, UseFormWatch } from "react-hook-form"; // ✅ Import dei tipi necessari

import FilterChips from "@/components/shared/FilterChips";
import SelectMenu from "@/components/shared/SelectMenu";
import { categories, genres, topic } from "@/data/data";

import SingleFilterChips from "../shared/SingleFilterChips";
import SingleSelectMenu from "../shared/SingleSelectMenu";

interface ArticleFormData {
  title: string;
  markdownPath: string;
  coverImage: string;
  category: string; // ✅ Ora è una stringa singola
  genres: string[];
  topics: string[];
}

// ✅ Definizione del tipo per il form
interface TagSelectorProps {
  setValue: UseFormSetValue<ArticleFormData>; // ✅ Ora accetta tutto l'oggetto ArticleFormData
  watch: UseFormWatch<ArticleFormData>; // ✅ Stessa cosa per watch
}

// 🔹 Configurazione delle opzioni disponibili
const tagOptions = {
  categories: categories.map(({ title }) => ({
    value: title,
    label: title.slice(0, 1).toUpperCase() + title.slice(1),
  })),
  genres: genres.map(({ title }) => ({
    value: title,
    label: title.slice(0, 1).toUpperCase() + title.slice(1),
  })),
  topics: topic.map(({ title }) => ({
    value: title,
    label: title.slice(0, 1).toUpperCase() + title.slice(1),
  })),
};

export default function TagSelector({ setValue, watch }: TagSelectorProps) {
  const selectedCategory = watch("category");
  const selectedGenres = watch("genres");
  const selectedTopics = watch("topics");

  return (
    <div className="space-y-6 pt-8 lg:w-1/2 lg:mx-12">
      <h2 className="lg:hidden text-2xl font-bold text-center mb-12 font-title text-gradient animated-gradient">
        Aggiungi le tag all&apos;articolo
      </h2>

      {/* Categorie */}
      <div className="block sm:hidden">
        <SingleSelectMenu
          label="Categorie"
          options={tagOptions.categories}
          selectedOption={selectedCategory || ""}
          onChange={(value) => setValue("category", value)}
        />
      </div>
      <div className="hidden sm:block">
        <SingleFilterChips
          label="Categorie"
          options={tagOptions.categories}
          selectedOption={selectedCategory || ""}
          onChange={(value) => setValue("category", value)}
        />
      </div>

      {/* Generi */}
      <div className="block sm:hidden">
        <SelectMenu
          label="Generi"
          options={tagOptions.genres}
          selectedOptions={selectedGenres || []}
          onChange={(values) => setValue("genres", values)}
        />
      </div>
      <div className="hidden sm:block">
        <FilterChips
          label="Generi"
          options={tagOptions.genres}
          selectedOptions={selectedGenres || []}
          onChange={(values) => setValue("genres", values)}
        />
      </div>

      {/* Temi (Topics) */}
      <div className="block sm:hidden">
        <SelectMenu
          label="Topics"
          options={tagOptions.topics}
          selectedOptions={selectedTopics || []}
          onChange={(values) => setValue("topics", values)}
        />
      </div>
      <div className="hidden sm:block">
        <FilterChips
          label="Topics"
          options={tagOptions.topics}
          selectedOptions={selectedTopics || []}
          onChange={(values) => setValue("topics", values)}
        />
      </div>
    </div>
  );
}
