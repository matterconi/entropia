import { notFound } from "next/navigation";
import React from "react";
import { FaImage, FaInfoCircle, FaMarkdown, FaTag } from "react-icons/fa";

import ArticleUploadForm from "@/components/forms/ArticleUploadForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

async function Page({ params }: { params: Promise<{ tipo: string }> }) {
  const resolvedParams = await params;
  const { tipo } = resolvedParams;

  // Verifica che il tipo sia valido
  if (tipo !== "post" && tipo !== "serie" && tipo !== "capitolo") {
    notFound();
  }

  // Determina il titolo in base al tipo
  const getTitolo = () => {
    switch (tipo) {
      case "post":
        return "Carica un nuovo articolo";
      case "serie":
        return "Crea una nuova serie";
      case "capitolo":
        return "Aggiungi un nuovo capitolo";
      default:
        return "Carica contenuto";
    }
  };

  // Contenuto del mini tutorial in base al tipo
  const getTutorialContent = () => {
    switch (tipo) {
      case "post":
        return (
          <>
            <div className="flex items-center mb-3">
              <FaInfoCircle className="text-blue-500 text-xl mr-2" />
              <h3 className="font-bold text-lg">
                Caricamento articolo singolo
              </h3>
            </div>

            <p className="text-sm">
              Stai per pubblicare un <strong>articolo singolo</strong>, un
              contenuto completo e autoconclusivo. Questo formato è ideale per
              recensioni, guide o riflessioni che non necessitano di
              suddivisione in capitoli.
            </p>

            <p className="text-sm mt-2">
              Una volta compilati tutti i campi e caricato il file, il tuo
              articolo sarà immediatamente disponibile nella sezione pubblica
              del sito e visibile ai lettori.
            </p>

            <p className="text-sm mt-2">
              Per suggerimenti sulla scrittura e le best practice, consulta la{" "}
              <a
                href="/guida-pubblicazione"
                className="text-blue-500 hover:underline"
              >
                guida alla pubblicazione
              </a>
              .
            </p>
          </>
        );
      case "serie":
        return (
          <>
            <div className="flex items-center mb-3">
              <FaInfoCircle className="text-blue-500 text-xl mr-2" />
              <h3 className="font-bold text-lg">
                Creazione di una nuova serie
              </h3>
            </div>

            <p className="text-sm">
              Stai creando una <strong>serie</strong>, un contenitore che
              raggrupperà più capitoli correlati. Le serie sono perfette per
              contenuti strutturati, tutorial a più parti o narrazioni che si
              sviluppano nel tempo.
            </p>

            <p className="text-sm mt-2">
              In questa fase definirai solo il titolo, la descrizione e
              l&apos;immagine della serie, mentre i contenuti veri e propri
              saranno aggiunti successivamente come capitoli. Una serie diventa
              visibile solo dopo aver pubblicato almeno un capitolo.
            </p>

            <p className="text-sm mt-2">
              Dopo aver creato la serie, potrai facilmente aggiungere capitoli
              dalla sezione &quot;Carica capitolo&quot;.
            </p>
          </>
        );
      case "capitolo":
        return (
          <>
            <div className="flex items-center mb-3">
              <FaInfoCircle className="text-blue-500 text-xl mr-2" />
              <h3 className="font-bold text-lg">
                Aggiunta di un nuovo capitolo
              </h3>
            </div>

            <p className="text-sm">
              Stai aggiungendo un <strong>capitolo</strong> a una serie
              esistente. I capitoli sono parti individuali di un contenuto più
              ampio e devono essere collegati a una serie che hai già creato.
            </p>

            <p className="text-sm mt-2">
              Il sistema ti suggerirà automaticamente il prossimo numero per la
              serie selezionata. Ogni capitolo mantiene le categorie della serie
              principale, ma puoi dargli un titolo unico che lo distingua.
            </p>

            <p className="text-sm mt-2">
              Quando pubblichi un nuovo capitolo, questo viene aggiunto alla
              pagina della serie e i lettori che seguono il tuo lavoro
              riceveranno una notifica.
            </p>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Mini Tutorial */}
      <Alert className="mb-8 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
        {getTutorialContent()}
      </Alert>

      {/* Renderizza il form appropriato in base al tipo */}
      {tipo === "post" && <ArticleUploadForm tipo={tipo} />}
      {tipo === "serie" && <ArticleUploadForm tipo={tipo} />}
      {tipo === "capitolo" && <ArticleUploadForm tipo={tipo} />}
    </div>
  );
}

export default Page;
