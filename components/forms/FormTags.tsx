"use client";

import React from "react";
import { Controller } from "react-hook-form";

import FilterChips from "@/components/shared/FilterChips";
import SelectMenu from "@/components/shared/SelectMenu";
import { categories, genres, topic } from "@/data/data";

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

export default function TagSelector({ setValue, watch }) {
  const selectedCategories = watch("categories");
  const selectedGenres = watch("genres");
  const selectedTopics = watch("topics");

  return (
    <div className="space-y-6 pt-8 lg:w-1/2 lg:mx-12">
      <h2 className="lg:hidden text-2xl font-bold text-center mb-12 font-title text-gradient animated-gradient">
        Aggiungi le tag all'articolo
      </h2>

      {/* Categorie */}
      <div className="block sm:hidden">
        <SelectMenu
          label="Categorie"
          options={tagOptions.categories}
          selectedOptions={selectedCategories || []}
          onChange={(values) => setValue("categories", values)}
        />
      </div>
      <div className="hidden sm:block">
        <FilterChips
          label="Categorie"
          options={tagOptions.categories}
          selectedOptions={selectedCategories || []}
          onChange={(values) => setValue("categories", values)}
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
          label="Topics"
          options={tagOptions.topics}
          selectedOptions={selectedTopics || []}
          onChange={(values) => setValue("topics", values)}
        />
      </div>
    </div>
  );
}
