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
    description:
      "Brevi storie che evocano emozioni e riflessioni. Da leggere tutti d'un fiato in qualsiasi momento della giornata per vivere oltre i propri confini, sognare ad occhi aperti e immaginare il possibile.",
    href: "/categorie/racconti",
  },
  {
    title: "Poesie",
    description:
      "Versi che esplorano i sentimenti e la bellezza del linguaggio. Per chi ama la poesia e la sua capacità di emozionare, in un mondo che ha dimenticato la sua importanza.",
    href: "/categorie/poesie",
  },
  {
    title: "Saggi",
    description:
      "Analisi e opinioni su temi di attualità e cultura. Sono spunti di riflessione e interprezioni della realtà, adatti a stimolare un dibatto critico e costruttivo.",
    href: "/categorie/saggi",
  },
  {
    title: "Tutorial",
    description:
      "Guide pratiche per imparare nuove abilità. La società contemporanea è una società basata sulla conoscenza, e imparare è un diritto e un dovere. Come un continuo aggiornamento, abbiamo pensato questa sezione per insegnare e apprendere.",
    href: "/categorie/tutorial",
  },
  {
    title: "Recensioni",
    description:
      "Opinioni e critiche su libri, film e altro. Sono diverse dai saggi perché sono più leggere e personali, e si concentrano su un'opera specifica. Una recensione non ha la pretesa di essere esaustiva, ma di offrire un'opinione personale.",
    href: "/categorie/recensioni",
  },
  {
    title: "Blog",
    description:
      "Pensieri, riflessioni e esperienze personali. Un fotogramma, un'istantanea della vita di chi scrive, un salto nelle sue avventure, nelle sue emozioni e nelle sue idee. Raccontare se stessi per raccontare il mondo, raccontare il mondo per raccontare se stessi.",
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
