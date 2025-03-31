import {
  BookOpen,
  BookText,
  Coffee,
  MessageSquare,
  Pen,
  Rocket,
} from "lucide-react";
import Link from "next/link";
import React from "react";

import { RainbowButton } from "../ui/rainbow-button";
import { ShinyButton } from "../ui/shiny-button";

interface Option {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  buttonText: string;
  iconColor: string;
}

export default function UploadOptionsPage() {
  const options: Option[] = [
    {
      id: "post",
      title: "Carica un Articolo",
      description:
        "Gli articoli sono contenuti autonomi, perfetti per racconti brevi, riflessioni o analisi. Scegli questa opzione per pubblicare contenuti che non fanno parte di una serie più ampia.",
      icon: <Pen size={40} />,
      link: "/carica-articolo/post",
      buttonText: "Scrivi Articolo",
      iconColor: "text-indigo-500",
    },
    {
      id: "series",
      title: "Crea una Serie",
      description:
        "Le serie ti permettono di pubblicare storie a puntate o contenuti correlati. Crea una nuova serie quando vuoi iniziare un racconto che si svilupperà in più capitoli nel tempo.",
      icon: <BookOpen size={40} />,
      link: "/carica-articolo/serie",
      buttonText: "Inizia Serie",
      iconColor: "text-emerald-500",
    },
    {
      id: "chapter",
      title: "Aggiungi un Capitolo",
      description:
        "Aggiungi nuovi capitoli alle tue serie esistenti per continuare le tue storie. Ogni capitolo apparirà nel feed con la propria immagine e titolo, collegato alla serie principale.",
      icon: <BookText size={40} />,
      link: "/carica-articolo/capitolo",
      buttonText: "Aggiungi Capitolo",
      iconColor: "text-amber-500",
    },
  ];

  const OptionCard = ({ option }: { option: Option }) => (
    <div className="w-full h-full border-gradient animated-gradient rounded-lg p-[1px] cursor-pointer">
      <div className="w-full h-full bg-background rounded-lg py-8 px-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center mb-4">
            <span className={option.iconColor}>{option.icon}</span>
          </div>
          <h3 className="text-xl font-bold text-foreground">{option.title}</h3>
          <p className="text-muted-foreground text-sm min-h-[80px]">
            {option.description}
          </p>
          <Link href={option.link}>
            <div className="w-fit h-fit border-gradient animated-gradient p-[1px] rounded-lg mx-auto mt-6">
              <div className="w-fit h-fit bg-background rounded-lg mx-auto">
                <ShinyButton className="font-sans font-semibold py-2 px-6">
                  <p className="text-gradient">{option.buttonText}</p>
                </ShinyButton>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );

  const TipsSection = () => (
    <div className="mt-20 mb-8">
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent mb-16" />

      <h2 className="text-2xl font-bold text-center mb-12 text-foreground">
        Consigli per creatori
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="flex flex-col items-center md:items-start md:flex-row gap-4">
          <div className="flex-shrink-0 p-3 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full">
            <Coffee className="text-indigo-500" size={28} />
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-center md:text-left text-foreground">
              Crea con regolarità
            </h3>
            <p className="text-sm text-muted-foreground">
              La regolarità nelle pubblicazioni è la chiave per costruire un
              pubblico fedele. Stabilisci un calendario editoriale e cerca di
              rispettarlo. Anche un breve racconto o capitolo ogni settimana può
              fare la differenza.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-start md:flex-row gap-4">
          <div className="flex-shrink-0 p-3 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full">
            <Rocket className="text-emerald-500" size={28} />
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-center md:text-left text-foreground">
              Immagini accattivanti
            </h3>
            <p className="text-sm text-muted-foreground">
              Un&apos;immagine di copertina di qualità può aumentare
              notevolmente la visibilità dei tuoi contenuti. Scegli immagini che
              catturino l&apos;essenza della tua storia e che si distinguano nel
              feed degli utenti.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-start md:flex-row gap-4">
          <div className="flex-shrink-0 p-3 bg-amber-500/10 dark:bg-amber-500/20 rounded-full">
            <MessageSquare className="text-amber-500" size={28} />
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-center md:text-left text-foreground">
              Interagisci con i lettori
            </h3>
            <p className="text-sm text-muted-foreground">
              Rispondere ai commenti e interagire con il tuo pubblico crea un
              legame più forte. Non sottovalutare il potere del dialogo: i
              lettori apprezzano gli autori che li coinvolgono e sono più
              propensi a seguire il tuo lavoro.
            </p>
          </div>
        </div>
      </div>
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent my-16" />
      <div className="text-center">
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8 text-sm">
          Vuoi approfondire le tecniche di scrittura o scoprire strategie per
          aumentare l&apos;engagement? La nostra guida ha tutto quello che ti
          serve.
        </p>
        <Link href="/guida">
          <RainbowButton className="font-sans font-semibold py-2 px-6 w-fit">
            Leggi la Guida
          </RainbowButton>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-16 text-gradient animated-gradient">
        Cosa vuoi pubblicare oggi?
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mx-auto">
        {options.map((option) => (
          <OptionCard option={option} key={option.id} />
        ))}
      </div>

      <TipsSection />
    </div>
  );
}
