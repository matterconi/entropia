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
    title: "Viaggi",
    description:
      "Esperienze, emozioni e riflessioni personali. Ogni viaggio è un frammento di vita, un racconto che intreccia il mondo interiore con quello esterno. Attraverso avventure e scoperte, narrare se stessi diventa un modo per esplorare e comprendere il mondo.",
    href: "/categorie/viaggi",
  },
  {
    title: "Pensieri",
    description:
      "Spazi di riflessione e confronto, dove opinioni e idee prendono forma. Un invito a condividere il proprio sguardo sul mondo, a esplorare le complessità della realtà e a dialogare con nuove prospettive.",
    href: "/categorie/pensieri",
  },
];

// Define genres (generi)
export const genres: MenuItem[] = [
  {
    title: "Romantico",
    description:
      "Storie d'amore e relazioni umane. Un tuffo nelle emozioni della vita e dei sentimenti.",
    href: "/generi/romantico",
  },
  {
    title: "Azione",
    description:
      "Avventure ad alta adrenalina e conflitti dinamici. Combattimenti, inseguimenti e colpi di scena che vi terranno incollati allo schermo.",
    href: "/generi/azione",
  },
  {
    title: "Avventura",
    description:
      "Viaggi emozionanti alla scoperta di nuovi mondi. Esplorazioni, scoperte e sfide che metteranno alla prova il coraggio dei protagonisti. Per chi ama l'ignoto e l'avventura.",
    href: "/generi/avventura",
  },
  {
    title: "Fantasy",
    description:
      "Universi magici popolati da creature straordinarie. Magia, mistero, eroi e mostri in un mix di epica e meraviglia al di là dei confini dell'immaginazione.",
    href: "/generi/fantasy",
  },
  {
    title: "Fantascienza",
    description:
      "Esplorazioni di futuri possibili e tecnologie innovative. Viaggi spaziali, robotica e mondi alieni sono il cuore di queste storie, con al centro il conflitto tra uomo e tecnologia.",
    href: "/generi/fantascienza",
  },
  {
    title: "Horror",
    description:
      "Narrazioni che suscitano paura e suspense. Psicologia e angosce sono gli ingredienti principali di queste storie, che esplorano il lato oscuro dell'animo umano.",
    href: "/generi/horror",
  },
  {
    title: "Giallo",
    description:
      "Indagini e misteri avvolgenti. Delitti, detective e colpi di scena in un mix di suspense e intuito investigativo, in cui la ricerca della verità non è mai innocua.",
    href: "/generi/giallo",
  },
  {
    title: "Drammatico",
    description:
      "Storie intense che esplorano emozioni profonde. Drammi umani, conflitti interiori e relazioni complesse sono il cuore di queste narrazioni, che toccano le corde dell'animo.",
    href: "/generi/drammatico",
  },
  {
    title: "Storico",
    description:
      "Racconti ambientati in epoche passate. Storie di re, regine, guerre e rivoluzioni che ci fanno viaggiare indietro nel tempo e ci insegnano qualcosa sul presente.",
    href: "/generi/storico",
  },
];

export const socialMedia = [
  {
    id: 1,
    img: "/icons/git.svg",
  },
  {
    id: 2,
    img: "/icons/twit.svg",
  },
  {
    id: 3,
    img: "/icons/link.svg",
  },
];
