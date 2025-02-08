import { categories, genres } from "./data";

const filtersConfig = [
  {
    id: "authors",
    label: "Autori",
    componentType: "checkbox",
    options: [
      { value: "Mario Rossi", label: "Mario Rossi" },
      { value: "Luca Verdi", label: "Luca Verdi" },
    ],
  },
  {
    id: "categories",
    label: "Categorie",
    componentType: categories.length <= 13 ? "chips" : "multiselect",
    options: categories.map((category) => ({
      value: category.title,
      label: category.title,
    })),
  },
  {
    id: "genres",
    label: "Generi",
    componentType: genres.length <= 13 ? "chips" : "checkbox",
    options: genres.map((genre) => ({
      value: genre.title,
      label: genre.title,
    })),
  },
  {
    id: "sort",
    label: "Ordina per",
    componentType: "radio",
    options: [
      { value: "alphabetical", label: "Ordine Alfabetico" },
      { value: "date", label: "Data" },
      { value: "views", label: "Visualizzazioni" },
      { value: "likes", label: "Like" },
    ],
  },
];

export { filtersConfig };
