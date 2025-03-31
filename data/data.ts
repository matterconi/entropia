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
  // Generi base
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
  // Generi letterari e movimenti artistici
  {
    title: "Surrealismo",
    description:
      "Narrazioni che esplorano l'inconscio e il mondo onirico, caratterizzate da immagini bizzarre e associazioni inaspettate che sfidano la logica ordinaria.",
    href: "/generi/surrealismo",
  },
  {
    title: "Modernismo",
    description:
      "Opere che rompono con le tradizioni narrative, sperimentando nuove tecniche e stili per esprimere la complessità della vita moderna e dell'esperienza soggettiva.",
    href: "/generi/modernismo",
  },
  {
    title: "Thriller",
    description:
      "Storie caratterizzate da tensione crescente, pericolo imminente e colpi di scena che mantengono alta l'attenzione del lettore fino all'ultima pagina.",
    href: "/generi/thriller",
  },
  {
    title: "Gotico",
    description:
      "Atmosfere cupe e inquietanti, ambientazioni misteriose e decadenti, con elementi soprannaturali che evocano sensazioni di terrore e meraviglia.",
    href: "/generi/gotico",
  },
  {
    title: "Minimalismo",
    description:
      "Narrazioni essenziali che utilizzano un linguaggio semplice e conciso, riducendo all'essenziale gli elementi narrativi per concentrarsi su ciò che è veramente significativo.",
    href: "/generi/minimalismo",
  },
  {
    title: "Romanticismo",
    description:
      "Opere che esaltano l'emotività, l'individualismo e la natura, in opposizione alla razionalità e alle convenzioni sociali, celebrando il sublime e l'irrazionale.",
    href: "/generi/romanticismo",
  },
  {
    title: "Realismo",
    description:
      "Narrazioni che rappresentano la realtà quotidiana in modo oggettivo e dettagliato, affrontando temi sociali e psicologici con uno sguardo critico e documentaristico.",
    href: "/generi/realismo",
  },
  {
    title: "Espressionismo",
    description:
      "Storie che privilegiano la rappresentazione soggettiva della realtà, distorcendola per esprimere emozioni intense e stati d'animo conflittuali.",
    href: "/generi/espressionismo",
  },
  {
    title: "Noir",
    description:
      "Atmosfere cupe e cinici protagonisti in un mondo corrotto. Crimini, inganno e moralità ambigua in storie dove la luce alla fine del tunnel è spesso solo un'illusione.",
    href: "/generi/noir",
  },
  {
    title: "Naturalismo",
    description:
      "Narrazioni che applicano principi scientifici all'analisi della società, esplorando come l'ambiente e l'ereditarietà determinino il comportamento umano.",
    href: "/generi/naturalismo",
  },
  {
    title: "Satirico",
    description:
      "Opere che utilizzano ironia, sarcasmo e ridicolizzazione per criticare vizi, follie e abusi della società, spesso con intento morale o politico.",
    href: "/generi/satirico",
  },
  {
    title: "Impressionismo",
    description:
      "Narrazioni che catturano impressioni fugaci e momentanee, privilegiando la percezione soggettiva alla descrizione dettagliata, creando un mosaico di sensazioni.",
    href: "/generi/impressionismo",
  },
  {
    title: "Cyberpunk",
    description:
      "Futuri distopici dominati da corporazioni e tecnologia avanzata. Hacker, intelligenze artificiali e realtà virtuale in un mondo dove l'umanità si fonde con la macchina.",
    href: "/generi/cyberpunk",
  },
  {
    title: "Filosofico",
    description:
      "Opere che esplorano questioni esistenziali e concettuali, utilizzando la narrazione come strumento per indagare il significato della vita e la natura della realtà.",
    href: "/generi/filosofico",
  },
  {
    title: "Distopico",
    description:
      "Visioni di futuri o società alternative caratterizzate da controllo oppressivo, disumanizzazione e catastrofi, che fungono da critica e avvertimento per il presente.",
    href: "/generi/distopico",
  },
  {
    title: "Postmoderno",
    description:
      "Narrazioni che giocano con la metafinzione, l'intertestualità e la frammentazione, mettendo in discussione verità assolute e gerarchie culturali.",
    href: "/generi/postmoderno",
  },
  {
    title: "Umoristico",
    description:
      "Storie che provocano il riso attraverso situazioni comiche, battute di spirito e personaggi eccentrici, spesso con un sottofondo di intelligente osservazione sociale.",
    href: "/generi/umoristico",
  },
  {
    title: "Simbolismo",
    description:
      "Opere che utilizzano simboli e suggestioni per evocare idee e stati d'animo, preferendo l'allusione alla descrizione diretta e privilegiando la dimensione spirituale.",
    href: "/generi/simbolismo",
  },
  {
    title: "Allegorico",
    description:
      "Narrazioni in cui personaggi, eventi e ambientazioni rappresentano concetti astratti o principi morali, creando un doppio livello di lettura, letterale e simbolico.",
    href: "/generi/allegorico",
  },
  {
    title: "Memorialistico",
    description:
      "Racconti basati su ricordi personali o collettivi, che esplorano la natura della memoria e il suo ruolo nella costruzione dell'identità e della storia.",
    href: "/generi/memorialistico",
  },
  {
    title: "Neorealismo",
    description:
      "Opere che rappresentano con crudo realismo le condizioni sociali del dopoguerra, focalizzandosi sulle classi popolari e utilizzando un linguaggio semplice e diretto.",
    href: "/generi/neorealismo",
  },
  {
    title: "Documentaristico",
    description:
      "Narrazioni che si basano su fatti reali e ricerche approfondite, presentando informazioni verificabili con un approccio oggettivo e metodico.",
    href: "/generi/documentaristico",
  },
  {
    title: "Esistenzialista",
    description:
      "Storie che esplorano la condizione umana in un universo apparentemente privo di significato intrinseco, focalizzandosi su scelte, responsabilità e autenticità.",
    href: "/generi/esistenzialista",
  },
  {
    title: "Introspettivo",
    description:
      "Opere incentrate sull'esplorazione del mondo interiore dei personaggi, dei loro pensieri, emozioni e conflitti psicologici, spesso con lunghi monologhi interiori.",
    href: "/generi/introspettivo",
  },
  {
    title: "Psicologico",
    description:
      "Storie focalizzate sull'analisi approfondita dei processi mentali ed emotivi dei personaggi, con particolare attenzione ai meccanismi psicologici e alle dinamiche comportamentali.",
    href: "/generi/psicologico",
  },
  {
    title: "Young Adult",
    description:
      "Opere rivolte principalmente ad un pubblico adolescente e giovane adulto, che affrontano temi di crescita, identità, relazioni e sfide tipiche di questa fase della vita.",
    href: "/generi/young-adult",
  },
  {
    title: "Realismo Magico",
    description:
      "Narrazioni che incorporano elementi fantastici e magici in un contesto realistico, dove l'incredibile viene presentato come parte ordinaria della realtà quotidiana.",
    href: "/generi/realismo-magico",
  },
  {
    title: "Epistolare",
    description:
      "Opere composte interamente o in parte da lettere, email, diari o altri documenti scritti dai personaggi, offrendo una prospettiva intima e soggettiva degli eventi.",
    href: "/generi/epistolare",
  },
  {
    title: "Metafisico",
    description:
      "Storie che esplorano questioni fondamentali sull'essere, la realtà, il tempo e la coscienza, sfidando le percezioni convenzionali e i limiti della comprensione umana.",
    href: "/generi/metafisico",
  },
  {
    title: "Bildungsroman",
    description:
      "Romanzi di formazione che seguono lo sviluppo fisico, morale, psicologico e sociale del protagonista dall'infanzia alla maturità, concentrandosi sulla ricerca di identità.",
    href: "/generi/bildungsroman",
  },
  {
    title: "Picaresco",
    description:
      "Narrazioni episodiche che seguono le avventure di un personaggio di umili origini che usa l'astuzia per sopravvivere in una società corrotta, spesso con tono satirico.",
    href: "/generi/picaresco",
  },
  {
    title: "Beat",
    description:
      "Opere influenzate dalla Beat Generation, caratterizzate da sperimentazione formale, rifiuto delle convenzioni sociali, spiritualità non-conformista e celebrazione della libertà.",
    href: "/generi/beat",
  },
  {
    title: "Speculativo",
    description:
      "Narrazioni che immaginano realtà alternative basate su premesse 'cosa succederebbe se', esplorando le conseguenze di cambiamenti scientifici, sociali o storici.",
    href: "/generi/speculativo",
  },
  {
    title: "Pulp",
    description:
      "Storie caratterizzate da uno stile vivace, trame avvincenti e spesso sensazionalistiche, personaggi archetipici e ritmo rapido, originariamente pubblicate su riviste economiche.",
    href: "/generi/pulp",
  },
  {
    title: "Nuovo Weird",
    description:
      "Opere che fondono elementi di fantascienza, fantasy e horror con tematiche surreali e sperimentali, creando ambientazioni inquietanti e difficilmente classificabili.",
    href: "/generi/nuovo-weird",
  },
];

// Define topics (argomenti)
export const topics = [
  // Topic originali
  {
    title: "Filosofia",
    description:
      "Riflessioni su idee, valori e significati della vita. Un viaggio nel pensiero umano attraverso le epoche.",
    href: "/topic/filosofia",
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

  // Nuovi topic
  {
    title: "Antropologia",
    description:
      "Esplorazioni della diversità culturale umana attraverso il tempo e lo spazio, analizzando costumi, credenze e strutture sociali che definiscono i diversi gruppi umani.",
    href: "/topic/antropologia",
  },
  {
    title: "Ecologia",
    description:
      "Riflessioni sul rapporto tra umanità e ambiente, sostenibilità e crisi climatica, con uno sguardo alla letteratura che affronta il nostro impatto sul pianeta.",
    href: "/topic/ecologia",
  },
  {
    title: "Etica",
    description:
      "Dibattiti sui principi morali e le scelte valoriali che guidano l'agire umano, esplorando dilemmi etici attraverso la narrativa e il pensiero critico.",
    href: "/topic/etica",
  },
  {
    title: "Media Digitali",
    description:
      "Analisi dell'evoluzione della comunicazione nell'era digitale, dei social network e del loro impatto sulla società contemporanea e sulla produzione culturale.",
    href: "/topic/media-digitali",
  },
  {
    title: "Linguistica",
    description:
      "Esplorazioni del linguaggio come strumento di espressione e comunicazione, analizzando evoluzioni, varietà e potere delle parole nell'esperienza umana.",
    href: "/topic/linguistica",
  },
  {
    title: "Economia",
    description:
      "Riflessioni su sistemi economici, disuguaglianze e modelli di sviluppo attraverso la lente della letteratura e del pensiero critico.",
    href: "/topic/economia",
  },
  {
    title: "Identità",
    description:
      "Indagini sul concetto di sé, appartenenza culturale e sociale, e sui processi di costruzione identitaria individuale e collettiva.",
    href: "/topic/identità",
  },
  {
    title: "Futuro",
    description:
      "Speculazioni e visioni sul domani dell'umanità, tra utopie, distopie e scenari possibili, analizzando come la letteratura immagina ciò che verrà.",
    href: "/topic/futuro",
  },
  {
    title: "Corporeità",
    description:
      "Riflessioni sul corpo come spazio di esperienza, significato e politica, esplorando come la letteratura rappresenta e interpreta l'esperienza fisica.",
    href: "/topic/corporeità",
  },
  {
    title: "Educazione",
    description:
      "Analisi dei processi formativi, pedagogici e di crescita personale, esaminando il ruolo della cultura nella formazione dell'individuo.",
    href: "/topic/educazione",
  },
  {
    title: "Viaggi",
    description:
      "Esplorazioni di luoghi, culture e spostamenti, sia fisici che interiori, attraverso racconti di viaggio e narrazioni di scoperta.",
    href: "/topic/viaggi",
  },
  {
    title: "Gastronomia",
    description:
      "Riflessioni sul cibo come elemento culturale, identitario e narrativo, analizzando la letteratura che esplora il rapporto tra esseri umani e alimentazione.",
    href: "/topic/gastronomia",
  },
  {
    title: "Architettura",
    description:
      "Analisi degli spazi costruiti e del loro significato simbolico e sociale, esplorando come la letteratura rappresenta e interpreta l'ambiente edificato.",
    href: "/topic/architettura",
  },
  {
    title: "Giochi",
    description:
      "Esplorazioni del ludico come dimensione culturale e sociale, dai videogiochi ai giochi tradizionali, analizzandone significati e impatti.",
    href: "/topic/giochi",
  },
  {
    title: "Moda",
    description:
      "Riflessioni sull'abbigliamento e lo stile come espressione identitaria e culturale, esaminando la loro rappresentazione nella letteratura e nei media.",
    href: "/topic/moda",
  },
  {
    title: "Relazioni",
    description:
      "Analisi dei legami interpersonali, dall'amicizia all'amore, dalla famiglia alle comunità, esplorando come la narrativa rappresenta le connessioni umane.",
    href: "/topic/relazioni",
  },
  {
    title: "Memoria",
    description:
      "Riflessioni sul ricordo personale e collettivo, sul trauma e sulla preservazione del passato, attraverso la lente della letteratura e dell'arte.",
    href: "/topic/memoria",
  },
  {
    title: "Mitologia",
    description:
      "Esplorazioni di racconti ancestrali, divinità e archetipi che hanno plasmato culture e immaginari, analizzandone la persistenza nella letteratura contemporanea.",
    href: "/topic/mitologia",
  },
  {
    title: "Innovazione",
    description:
      "Analisi del processo creativo, delle scoperte rivoluzionarie e dei cambiamenti paradigmatici in vari campi, dalla scienza all'arte alla società.",
    href: "/topic/innovazione",
  },
  {
    title: "Natura",
    description:
      "Riflessioni sul mondo naturale, la biodiversità e il rapporto tra esseri umani e ambiente, attraverso narrazioni che celebrano o problematizzano questo legame.",
    href: "/topic/natura",
  },
  {
    title: "Urbanistica",
    description:
      "Analisi delle città come organismi vivi, della pianificazione urbana e dell'esperienza metropolitana, attraverso la lente della letteratura e del pensiero critico.",
    href: "/topic/urbanistica",
  },
  {
    title: "Simbolismo",
    description:
      "Esplorazioni di metafore, allegorie e rappresentazioni simboliche utilizzate nelle arti e nella letteratura per veicolare significati profondi e universali.",
    href: "/topic/simbolismo",
  },
  {
    title: "Folclore",
    description:
      "Analisi di tradizioni popolari, leggende, fiabe e credenze tramandate oralmente, studiandone l'evoluzione e il ruolo nella definizione dell'identità culturale.",
    href: "/topic/folclore",
  },
  {
    title: "Comunicazione",
    description:
      "Riflessioni sulle modalità con cui gli esseri umani trasmettono informazioni, emozioni e idee, dalle conversazioni quotidiane ai grandi media.",
    href: "/topic/comunicazione",
  },
  {
    title: "Conflitto",
    description:
      "Analisi di scontri, guerre e tensioni tra individui, gruppi e nazioni, esaminando come la letteratura rappresenta e interpreta queste dinamiche.",
    href: "/topic/conflitto",
  },
  {
    title: "Crescita Personale",
    description:
      "Esplorazioni del percorso di evoluzione individuale, dalla conoscenza di sé al superamento di limiti e traumi, attraverso narrazioni di trasformazione.",
    href: "/topic/crescita-personale",
  },
  {
    title: "Giustizia",
    description:
      "Riflessioni su legalità, equità e sistemi giudiziari, analizzando opere che esplorano il concetto di giusto e la tensione tra legge e morale.",
    href: "/topic/giustizia",
  },
  {
    title: "Globalizzazione",
    description:
      "Analisi dell'interconnessione planetaria, dei suoi effetti su culture, economie e individui, attraverso la lente della letteratura contemporanea.",
    href: "/topic/globalizzazione",
  },
  {
    title: "Comunità",
    description:
      "Esplorazioni di gruppi umani uniti da valori, interessi o territori condivisi, analizzando il senso di appartenenza e le dinamiche sociali al loro interno.",
    href: "/topic/comunità",
  },
  {
    title: "Sport",
    description:
      "Riflessioni sull'attività fisica competitiva, i suoi valori, i suoi eroi e il suo impatto culturale, attraverso narrazioni che ne celebrano lo spirito.",
    href: "/topic/sport",
  },
  {
    title: "Multiculturalismo",
    description:
      "Analisi della convivenza tra diverse culture, tradizioni e visioni del mondo, esplorando sfide e ricchezze dello scambio interculturale.",
    href: "/topic/multiculturalismo",
  },
  {
    title: "Lavoro",
    description:
      "Riflessioni sul mondo professionale, le trasformazioni economiche e il significato dell'attività lavorativa nella vita umana e nella società.",
    href: "/topic/lavoro",
  },
  {
    title: "Salute",
    description:
      "Esplorazioni del benessere fisico e mentale, della malattia e della cura, analizzando come la letteratura rappresenta l'esperienza corporea in salute e sofferenza.",
    href: "/topic/salute",
  },
  {
    title: "Emigrazione",
    description:
      "Analisi di spostamenti umani, esili e diaspore, esplorando l'esperienza di chi lascia la propria terra e le trasformazioni che questo comporta.",
    href: "/topic/emigrazione",
  },
  {
    title: "Fantasia",
    description:
      "Riflessioni sull'immaginazione, i mondi alternativi e la capacità umana di creare universi mentali al di là della realtà percepita.",
    href: "/topic/fantasia",
  },
  {
    title: "Tempo",
    description:
      "Esplorazioni della temporalità, della memoria e della percezione del fluire cronologico, analizzando come la letteratura gioca con questa dimensione fondamentale.",
    href: "/topic/tempo",
  },
  {
    title: "Infanzia",
    description:
      "Analisi della prima fase della vita umana, delle sue peculiarità psicologiche e sociali, attraverso narrazioni che ne catturano l'essenza e la complessità.",
    href: "/topic/infanzia",
  },
  {
    title: "Teatro",
    description:
      "Riflessioni sull'arte scenica, sui suoi testi, le sue performance e il suo ruolo culturale attraverso i secoli, tra tradizione e sperimentazione.",
    href: "/topic/teatro",
  },
  {
    title: "Diritti Umani",
    description:
      "Esplorazioni di libertà fondamentali, dignità e giustizia sociale, analizzando opere che denunciano violazioni o celebrano conquiste in questo ambito.",
    href: "/topic/diritti-umani",
  },
  {
    title: "Intelligenza Artificiale",
    description:
      "Analisi delle macchine pensanti, del loro rapporto con l'umanità e delle questioni etiche e filosofiche sollevate dal loro sviluppo crescente.",
    href: "/topic/intelligenza-artificiale",
  },
  {
    title: "Sogno",
    description:
      "Riflessioni sull'attività onirica, sul suo significato psicologico e culturale, e sul suo utilizzo come metafora e strumento narrativo nella letteratura.",
    href: "/topic/sogno",
  },
  {
    title: "Libertà",
    description:
      "Esplorazioni del concetto di autonomia individuale, emancipazione e assenza di costrizioni, analizzando come diverse opere lo interpretano e problematizzano.",
    href: "/topic/libertà",
  },
  {
    title: "Fotografia",
    description:
      "Analisi dell'arte di catturare immagini, della sua evoluzione tecnica e del suo impatto sulla percezione della realtà e sulla memoria collettiva.",
    href: "/topic/fotografia",
  },
  {
    title: "Animali",
    description:
      "Riflessioni sul mondo non umano, sul rapporto tra specie diverse e sulle rappresentazioni letterarie di creature che condividono con noi il pianeta.",
    href: "/topic/animali",
  },
  {
    title: "Potere",
    description:
      "Esplorazioni delle dinamiche di controllo, influenza e dominio tra individui e gruppi, analizzando come la letteratura rappresenta gerarchie e resistenze.",
    href: "/topic/potere",
  },
  {
    title: "Solitudine",
    description:
      "Analisi dell'esperienza di isolamento, sia come condizione dolorosa che come opportunità di introspezione, attraverso opere che ne esplorano le sfaccettature.",
    href: "/topic/solitudine",
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
