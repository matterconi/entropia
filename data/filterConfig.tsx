import { categories, genres, topics } from "./data";

interface Filter {
  id: string;
  label: string;
  componentType?: "chips" | "select" | "checkbox" | "multiselect" | "radio"; // Aggiunti i tipi mancanti
  options: { value: string; label: string }[];
}

export function getFiltersConfig(): Filter[] {
  const isMobile =
    typeof window !== "undefined" ? window.innerWidth < 768 : false;
  return [
    {
      id: "authors",
      label: "Autori",
      componentType: "checkbox",
      options: [
        {
          value: "MarioRossiMarioRossiMarioRossiMarioRossi",
          label: "MarioRossiMarioRossiMarioRossiMarioRossi",
        },
        { value: "Luca Verdi", label: "Luca Verdi" },
      ],
    },
    {
      id: "categories",
      label: "Categorie",
      componentType: isMobile ? "multiselect" : "chips",
      options: categories.map((category) => ({
        value: category.title,
        label: category.title,
      })),
    },
    {
      id: "genres",
      label: "Generi",
      componentType: isMobile ? "multiselect" : "chips",
      options: genres.map((genre) => ({
        value: genre.title,
        label: genre.title,
      })),
    },
    {
      id: "topics",
      label: "Topics",
      componentType: isMobile ? "multiselect" : "chips",
      options: topics.map((topic) => ({
        value: topic.title,
        label: topic.title,
      })),
    },
    {
      id: "sort",
      label: "Ordina per",
      componentType: "radio",
      options: [
        { value: "alphabetical", label: "Ordine Alfabetico" },
        { value: "new", label: "Più recenti" },
        { value: "old", label: "Più vecchi" },
        { value: "views", label: "Visualizzazioni" },
        { value: "likes", label: "Like" },
      ],
    },
  ];
}
