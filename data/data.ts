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

// Define topics (argomenti)
export const topics = [
  {
    title: "Filosofia",
    description:
      "Riflessioni su idee, valori e significati della vita. Un viaggio nel pensiero umano attraverso le epoche.",
    href: "/topic/filosofia",
  },
  {
    title: "Esistenzialismo",
    description:
      "Ricerca del significato delle vita attraverso l'esperienza umana. Un'analisi delle scelte, delle responsabilità e delle contraddizioni dell'esistenza.",
    href: "/topic/esistenzialismo",
  },
  {
    title: "Cinema",
    description:
      "Analisi e recensioni di opere cinematografiche, con un focus sulle storie, i personaggi e i messaggi delle pellicole.",
    href: "/topic/cinema",
  },
  {
    title: "Musica",
    description:
      "Esplorazioni di testi e melodie che accompagnano la vita. Una riflessione sul potere evocativo delle note.",
    href: "/topic/musica",
  },
  {
    title: "Arte",
    description:
      "Un viaggio tra dipinti, sculture e forme d'espressione visiva. L'arte come specchio dell'animo umano e della società.",
    href: "/topic/arte",
  },
  {
    title: "Politica",
    description:
      "Saggi e analisi sul potere, le istituzioni e le dinamiche sociali. Una lente sulle forze che modellano il mondo.",
    href: "/topic/politica",
  },
  {
    title: "Psicologia",
    description:
      "Uno sguardo sulle emozioni, i comportamenti e le dinamiche della mente umana. Tra introspezione e scienza.",
    href: "/topic/psicologia",
  },
  {
    title: "Società",
    description:
      "Approfondimenti su cultura, evoluzioni sociali e temi d'attualità. La letteratura come mezzo per comprendere il mondo.",
    href: "/topic/società",
  },
  {
    title: "Storia",
    description:
      "Analisi di eventi storici, figure iconiche e narrazioni che hanno segnato l'umanità. Il passato come chiave per interpretare il presente.",
    href: "/topic/storia",
  },
  {
    title: "Scienza e Tecnologia",
    description:
      "Esplorazioni di scoperte scientifiche, innovazioni e il loro impatto sulla società. La fusione tra letteratura e progresso.",
    href: "/topic/scienza-e-tecnologia",
  },
  {
    title: "Spiritualità",
    description:
      "Riflessioni sul senso della vita, la trascendenza e il rapporto tra uomo e universo. Una prospettiva tra il mistico e il personale.",
    href: "/topic/spiritualità",
  },
  {
    title: "Letteratura",
    description:
      "Saggi e analisi su libri, autori e movimenti letterari. Una celebrazione delle parole e del potere delle storie.",
    href: "/topic/letteratura",
  },
  {
    title: "Cultura Pop",
    description:
      "Un'immersione nelle tendenze, nei fenomeni e nei simboli della cultura di massa. Dalla narrativa ai media, uno specchio del nostro tempo.",
    href: "/topic/cultura-pop",
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
