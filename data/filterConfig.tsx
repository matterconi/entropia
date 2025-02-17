import { categories, genres } from "./data";

interface Filter {
  id: string;
  label: string;
  componentType?: "chips" | "select" | "checkbox" | "multiselect" | "radio"; // Aggiunti i tipi mancanti
  options: { value: string; label: string }[];
}

const filtersConfig: Filter[] = [
  {
    id: "authors",
    label: "Autori",
    componentType: "checkbox" as const, // TypeScript ora lo vede come "checkbox"
    options: [
      { value: "Mario Rossi", label: "Mario Rossi" },
      { value: "Luca Verdi", label: "Luca Verdi" },
    ],
  },
  {
    id: "categories",
    label: "Categorie",
    componentType: (categories.length <= 13 ? "chips" : "multiselect") as "chips" | "select" | "checkbox" | "multiselect" | "radio",
    options: categories.map((category) => ({
      value: category.title,
      label: category.title,
    })),
  },
  {
    id: "genres",
    label: "Generi",
    componentType: (genres.length <= 13 ? "chips" : "checkbox") as "chips" | "select" | "checkbox" | "multiselect" | "radio",
    options: genres.map((genre) => ({
      value: genre.title,
      label: genre.title,
    })),
  },
  {
    id: "sort",
    label: "Ordina per",
    componentType: "radio" as const, // TypeScript ora lo vede correttamente
    options: [
      { value: "alphabetical", label: "Ordine Alfabetico" },
      { value: "date", label: "Data" },
      { value: "views", label: "Visualizzazioni" },
      { value: "likes", label: "Like" },
    ],
  },
];


export { filtersConfig };
