"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

import { RainbowButton } from "../ui/rainbow-button";

const PercorsiComponent = () => {
  // Dati dei percorsi disponibili (ridotti a 4)
  const percorsi = [
    {
      id: "serie",
      titolo: "Le Serie",
      descrizione:
        "Opere divise in capitoli ordinati tra loro, da seguire in sequenza per un esperienza completa.",
      gradientClasses: "from-cyan-400 to-cyan-500",
      bgClasses: "bg-gradient-to-b from-cyan-50 to-cyan-100",
      icona: "📚",
      immagine: "/assets/series.png",
    },
    {
      id: "raccolte",
      titolo: "Le Raccolte",
      descrizione:
        "Opere composte da più articoli indipendenti che possono essere letti in qualsiasi ordine.",
      gradientClasses: "from-pink-400 to-pink-500",
      bgClasses: "bg-gradient-to-b from-pink-50 to-pink-100",
      icona: "📑",
      immagine: "/assets/raccolte.webp",
    },
    {
      id: "collezioni",
      titolo: "Le Collezioni",
      descrizione:
        "Gruppi di opere accomunate da un tema simile, organizzate per facilitare la scoperta di contenuti affini.",
      gradientClasses: "from-yellow-400 to-yellow-500",
      bgClasses: "bg-gradient-to-b from-yellow-50 to-yellow-100",
      icona: "🗃️",
      immagine: "/assets/collezioni.jpg",
    },
    {
      id: "tutti",
      titolo: "Tutti i percorsi",
      descrizione:
        "Esplora tutti i percorsi disponibili per trovare i contenuti che più ti interessano.",
      gradientClasses: "from-purple-400 to-purple-500",
      bgClasses: "bg-gradient-to-b from-purple-50 to-purple-100",
      icona: "🧭",
      immagine: "/assets/tutti-i-percorsi.webp",
    },
  ];

  // Gestione dello stato delle categorie, simile a CategoriesPage
  const [percorsiState, setPercorsiState] = useState([null, percorsi[0]]);

  // Per tenere traccia della carta attiva
  const [activeIndex, setActiveIndex] = useState(0);
  // Per tenere traccia della direzione dell'animazione
  const [direction, setDirection] = useState(0); // -1 = destra, 0 = nessuna direzione, 1 = sinistra

  // Per gestire lo swipe
  const deckRef = useRef(null);
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Per calcolare il raggio di distribuzione dello stack in base alla larghezza dello schermo
  const [stackRadius, setStackRadius] = useState({
    x: 4, // Fattore di spostamento X
    y: 10, // Fattore di spostamento Y
  });

  // Per tenere traccia dell'animazione precedente
  const [isAnimating, setIsAnimating] = useState(false);

  // Per forzare il re-render dei dots quando cambia la dimensione dello schermo
  const [dotsKey, setDotsKey] = useState(0);

  // Per il parallax offset dell'immagine
  const [offset, setOffset] = useState("0%");
  const containerRef = useRef(null);

  // Utilizziamo useEffect per gestire il display degli indicatori su resize e per l'effetto parallax
  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;

      if (windowWidth < 400) {
        // Schermi molto piccoli
        setStackRadius({
          x: 2, // Valore ridotto per schermi piccoli
          y: 5,
        });
      } else if (windowWidth < 640) {
        // Schermi piccoli
        setStackRadius({
          x: 3,
          y: 8,
        });
      } else {
        // Schermi medi e grandi
        setStackRadius({
          x: 4,
          y: 10,
        });
      }

      // Forza il re-render dei punti indicatori
      setDotsKey((prevKey) => prevKey + 1);
    };

    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate how far the container is in the viewport
      const progress = Math.min(Math.max(0, 1 - rect.bottom / windowHeight), 1);

      // Map progress to a desired range (e.g., "0%" to "50%")
      const mappedOffset = `${progress * 50}%`;
      setOffset(mappedOffset);
    };

    // Imposta i valori iniziali
    handleResize();
    handleScroll();

    // Aggiungi event listener per il resize e scroll
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Funzione per navigare tra le carte con animazione circolare
  const goToCard = (index) => {
    // Preveniamo cambiamenti rapidi che causerebbero flickering
    if (isAnimating) return;

    // Gestisci transizione circolare
    let newIndex;

    if (index < 0) {
      // Vai all'ultima carta quando si tenta di andare prima della prima
      newIndex = percorsi.length - 1;
      setDirection(-1); // Direzione: verso destra
    } else if (index >= percorsi.length) {
      // Vai alla prima carta quando si supera l'ultima
      newIndex = 0;
      setDirection(1); // Direzione: verso sinistra
    } else {
      // Navigazione normale
      newIndex = index;
      // Determina la direzione in base all'indice
      setDirection(newIndex > activeIndex ? 1 : -1);
    }

    // Segnaliamo che stiamo animando
    setIsAnimating(true);

    // Prima di cambiare indice, prepariamo lo stack per la transizione
    document.querySelectorAll(".card-transition").forEach((card) => {
      card.style.willChange = "transform";
    });

    // Aggiorna sia lo stato dell'indice attivo che lo stato dei percorsi
    setActiveIndex(newIndex);
    setPercorsiState(([_, current]) => [current, percorsi[newIndex]]);

    // Dopo la transizione, rimuoviamo willChange per ottimizzare le prestazioni
    setTimeout(() => {
      document.querySelectorAll(".card-transition").forEach((card) => {
        card.style.willChange = "auto";
      });
      setIsAnimating(false); // Fine animazione
      setDirection(0); // Resetta la direzione
    }, 500); // Tempo uguale alla durata della transizione
  };

  // Gestione dello swipe per dispositivi touch e mouse
  const handleTouchStart = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || isAnimating) return;
    // Preveniamo il comportamento di default (come lo scrolling)
    e.preventDefault();
  };

  const handleTouchEnd = (e) => {
    // Non facciamo nulla se: non stavamo trascinando o siamo in fase di animazione
    if (!isDragging || isAnimating) return;

    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const diff = startX - clientX;

    // Determina direzione dello swipe e cambia carta
    if (Math.abs(diff) > 50) {
      // Soglia per considerare uno swipe valido
      if (diff > 0) {
        // Swipe verso sinistra -> prossima carta (navigazione circolare)
        goToCard(activeIndex + 1);
      } else {
        // Swipe verso destra -> carta precedente (navigazione circolare)
        goToCard(activeIndex - 1);
      }
    }

    setIsDragging(false);
  };

  // Calcola la distanza circolare tra due indici
  const getCircularDistance = (index, fromIndex) => {
    const totalCards = percorsi.length;

    // Distanza in senso orario
    const clockwiseDistance = (index - fromIndex + totalCards) % totalCards;

    // Distanza in senso antiorario
    const counterClockwiseDistance =
      (fromIndex - index + totalCards) % totalCards;

    // Prendi la distanza minore
    const distance = Math.min(clockwiseDistance, counterClockwiseDistance);

    return distance;
  };

  // Funzione per renderizzare una singola carta
  const renderCard = (percorso, index) => {
    // Calcola la distanza dalla carta attiva in modo circolare
    const distance = getCircularDistance(index, activeIndex);

    // Determina la direzione visiva (a sinistra o a destra rispetto alla carta attiva)
    // In un sistema circolare, dobbiamo scegliere il percorso più breve
    let visualDirection;

    // Calcola la direzione visiva basata sul percorso più breve
    const clockwiseDistance =
      (index - activeIndex + percorsi.length) % percorsi.length;
    const counterClockwiseDistance =
      (activeIndex - index + percorsi.length) % percorsi.length;

    if (clockwiseDistance < counterClockwiseDistance) {
      visualDirection = 1; // A destra
    } else if (clockwiseDistance > counterClockwiseDistance) {
      visualDirection = -1; // A sinistra
    } else {
      visualDirection = 0; // Stessa posizione
    }

    // Visibilità condizionale - nascondiamo carte molto distanti per migliorare le performance
    const visibility = distance > 4 ? "hidden" : "visible";

    // Limita l'overflow gestendo meglio le dimensioni dello stack
    let maxOffset = {
      x: window.innerWidth < 400 ? 20 : window.innerWidth < 640 ? 30 : 40,
      y: window.innerWidth < 400 ? 25 : window.innerWidth < 640 ? 35 : 45,
    };

    // Calcola il valore di spostamento X basato su una funzione non lineare dell'indice
    const baseOffsetX = Math.min(
      Math.pow(distance, 1.2) * stackRadius.x,
      maxOffset.x,
    );
    const translateX = baseOffsetX * visualDirection;

    // Calcola il valore di spostamento Y usando una funzione diversa
    const translateY =
      distance === 0
        ? 0
        : Math.min(stackRadius.y * Math.sqrt(distance), maxOffset.y);

    // Calcola la rotazione usando un altro pattern
    const baseRotation = distance * 3; // 3 gradi per livello di distanza
    const variationFactor = index % 3 === 0 ? 1.2 : index % 3 === 1 ? 0.8 : 1; // Variazione basata sul modulo
    const rotate = baseRotation * visualDirection * variationFactor;

    // Calcola lo z-index - più alta è la distanza, più basso è lo z-index
    const zIndex = 100 - distance * 10;

    // Costruisci la stringa di trasformazione CSS
    const transformStyle = `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotate}deg)`;

    // Determina se questa è la carta attiva
    const isActive = distance === 0;

    return (
      <div
        className={`card-transition absolute w-[280px] sm:w-[300px] md:w-[400px] h-full rounded-lg ${percorso.bgClasses}`}
        style={{
          transform: transformStyle,
          transition: "transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)",
          zIndex: zIndex,
          visibility: visibility,
          pointerEvents: distance === 0 ? "auto" : "none",
        }}
      >
        {/* Utilizzo del border-gradient comune per tutte le carte */}
        <div className="flex flex-col h-full w-full overflow-hidden rounded-lg">
          {/* Contenuto principale */}
          <div className="flex flex-col h-full relative">
            {/* Immagine di sfondo - sempre presente */}
            <div className="absolute inset-0 w-full h-full">
              {isActive ? (
                <>
                  {/* Immagine Statica (per dissolvenza) */}
                  {percorsiState[0] && (
                    <motion.div
                      key={`static_${percorsiState[0].id}`}
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 0 }}
                      transition={{
                        duration: 1.5,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 w-full h-full z-10"
                    >
                      <Image
                        src={percorsiState[0].immagine}
                        alt={percorsiState[0].titolo}
                        fill
                        className="object-cover rounded-lg"
                        style={{
                          objectPosition: `center ${offset}`,
                        }}
                      />
                    </motion.div>
                  )}

                  {/* Immagine Dinamica con effetto di fade-in */}
                  <motion.div
                    key={`dynamic_${percorsiState[1].id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      duration: 0.8,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 w-full h-full z-20"
                  >
                    <Image
                      src={percorsiState[1].immagine}
                      alt={percorsiState[1].titolo}
                      fill
                      className="object-cover rounded-lg"
                      style={{
                        objectPosition: `center ${offset}`,
                      }}
                    />
                  </motion.div>
                </>
              ) : (
                <Image
                  src={percorso.immagine}
                  alt={percorso.titolo}
                  fill
                  className="object-cover rounded-lg"
                />
              )}
            </div>

            {/* Contenitore bianco STATICO (non animato) */}
            <div className="h-full w-full flex justify-center items-center z-40 px-10">
              <div className="bg-background rounded-lg p-6 shadow-md w-full">
                {isActive ? (
                  <>
                    {/* Animazioni per titolo e descrizione - questi cambiano con dissolvenza */}
                    <motion.div
                      key={`content_${percorsiState[1].id}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        duration: 0.6,
                        ease: "easeInOut",
                      }}
                      className="w-full flex flex-col gap-2"
                    >
                      <h3 className="text-xl font-bold text-gradient font-title text-center">
                        {percorsiState[1].titolo}
                      </h3>
                      <p className="text-sm sm:text-base leading-relaxed mb-4 text-foregound">
                        {percorsiState[1].descrizione}
                      </p>

                      <div className="mt-auto">
                        <Link
                          href={`/${percorsiState[1].id}/`}
                          className="block w-full"
                        >
                          <RainbowButton className="p-2">Esplora</RainbowButton>
                        </Link>
                      </div>
                    </motion.div>
                  </>
                ) : (
                  <>
                    {/* Contenuto non animato per le carte non attive */}
                    <h3 className="text-xl font-bold text-gradient font-title text-center">
                      {percorso.titolo}
                    </h3>
                    <p className="text-sm sm:text-base leading-relaxed mb-4 text-gray-600">
                      {percorso.descrizione}
                    </p>

                    <div className="mt-auto">
                      <Link href={`/${percorso.id}/`} className="block w-full">
                        <RainbowButton className="p-2">
                          Esplora
                          <svg
                            stroke="currentColor"
                            fill="currentColor"
                            strokeWidth="0"
                            viewBox="0 0 24 24"
                            height="1em"
                            width="1em"
                            xmlns="http://www.w3.org/2000/svg"
                            className="inline-block ml-2"
                          >
                            <path fill="none" d="M0 0h24v24H0z"></path>
                            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
                          </svg>
                        </RainbowButton>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-screen overflow-hidden px-2 sm:px-4" ref={containerRef}>
      {/* Container per il mazzo di carte con gestione migliorata del centramento */}
      <div className="relative px-2 sm:px-10 py-6 sm:py-10 flex justify-center items-center">
        {/* Contenitore centralizzato dello stack */}
        <div
          ref={deckRef}
          className={`relative h-[450px] select-none w-[280px] sm:w-[300px] md:w-[400px] ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          } overflow-visible`}
          onMouseDown={handleTouchStart}
          onMouseMove={handleTouchMove}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Rendering condizionale delle carte per evitare sovraccarico */}
          {percorsi.map((percorso, index) => (
            <div key={percorso.id} className="overflow-visible">
              {renderCard(percorso, index)}
            </div>
          ))}
        </div>
      </div>

      {/* Controlli di navigazione */}
      <div className="flex justify-center items-center gap-4 sm:gap-6 mt-6 sm:mt-8">
        <button
          className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-md text-gray-700 transition-all duration-200 hover:bg-gray-100"
          onClick={() => !isAnimating && goToCard(activeIndex - 1)}
          disabled={isAnimating}
          aria-label="Carta precedente"
        >
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 24 24"
            height="1.5em"
            width="1.5em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path fill="none" d="M0 0h24v24H0z"></path>
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
          </svg>
        </button>

        {/* Indicatori con gradient border coerente */}
        <div
          key={dotsKey}
          className="flex flex-wrap justify-center gap-2 sm:gap-3"
        >
          {percorsi.map((percorso, idx) => {
            // Utilizziamo il gradient per l'indicatore attivo
            const activeClass =
              idx === activeIndex
                ? `bg-gradient-to-r ${percorso.gradientClasses} scale-110`
                : "bg-gray-300 scale-100 hover:bg-gray-400";

            return (
              <button
                key={idx}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${activeClass}`}
                onClick={() => !isAnimating && goToCard(idx)}
                aria-label={`Vai alla card ${idx + 1}`}
                disabled={isAnimating}
              />
            );
          })}
        </div>

        <button
          className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-md text-gray-700 transition-all duration-200 hover:bg-gray-100"
          onClick={() => !isAnimating && goToCard(activeIndex + 1)}
          disabled={isAnimating}
          aria-label="Carta successiva"
        >
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 24 24"
            height="1.5em"
            width="1.5em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path fill="none" d="M0 0h24v24H0z"></path>
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PercorsiComponent;
