// Define types for category and genre items
export interface MenuItem {
  title: string;
  description: string;
  href: string;
}

// Define categories (categorie)
export const categories: MenuItem[] = [
  {
    title: "Racconti",
    description: "Brevi storie che evocano emozioni e riflessioni.",
    href: "/categorie/racconti",
  },
  {
    title: "Poesie",
    description:
      "Versi che esplorano i sentimenti e la bellezza del linguaggio.",
    href: "/categorie/poesie",
  },
  {
    title: "Saggi",
    description: "Analisi e opinioni su temi di attualità e cultura.",
    href: "/categorie/saggi",
  },
  {
    title: "Tutorial",
    description: "Guide pratiche per imparare nuove abilità.",
    href: "/categorie/tutorial",
  },
  {
    title: "Recensioni",
    description: "Opinioni e critiche su libri, film e altro.",
    href: "/categorie/recensioni",
  },
  {
    title: "Blog",
    description: "Pensieri, riflessioni e esperienze personali.",
    href: "/categorie/blog",
  },
];

// Define genres (generi)
export const genres: MenuItem[] = [
  {
    title: "Romantico",
    description: "Storie d'amore e relazioni umane.",
    href: "/generi/romantico",
  },
  {
    title: "Azione",
    description: "Avventure ad alta adrenalina e conflitti dinamici.",
    href: "/generi/azione",
  },
  {
    title: "Avventura",
    description: "Viaggi emozionanti e scoperta di nuovi mondi.",
    href: "/generi/avventura",
  },
  {
    title: "Fantasy",
    description: "Universi magici popolati da creature straordinarie.",
    href: "/generi/fantasy",
  },
  {
    title: "Fantascienza",
    description: "Esplorazioni di futuri possibili e tecnologie innovative.",
    href: "/generi/fantascienza",
  },
  {
    title: "Horror",
    description: "Narrazioni che suscitano paura e suspense.",
    href: "/generi/horror",
  },
  {
    title: "Giallo",
    description: "Indagini e misteri avvolgenti.",
    href: "/generi/giallo",
  },
  {
    title: "Drammatico",
    description: "Storie intense che esplorano emozioni profonde.",
    href: "/generi/drammatico",
  },
  {
    title: "Storico",
    description: "Racconti ambientati in epoche passate.",
    href: "/generi/storico",
  },
];
