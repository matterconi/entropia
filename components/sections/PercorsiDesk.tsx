"use client";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-creative";

import { motion, useAnimation, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { EffectCreative, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { RainbowButton } from "../ui/rainbow-button";

const PercorsiSliderLg = () => {
  const [offset, setOffset] = useState("0%");
  const [slidesPerView, setSlidesPerView] = useState("auto");
  const containerRef = useRef(null);
  const [showLeftBlur, setShowLeftBlur] = useState(false);
  const [showRightBlur, setShowRightBlur] = useState(true);
  const swiperRef = useRef(null);

  // Dati dei percorsi
  const percorsi = [
    {
      id: "serie",
      titolo: "Serie",
      descrizione:
        "Opere divise in capitoli ordinati tra loro, da seguire in sequenza per un esperienza completa.",
      gradientClasses: "from-cyan-400 to-cyan-500",
      bgClasses: "bg-gradient-to-b from-cyan-50 to-cyan-100",
      icona: "📚",
      immagine: "/assets/series.png",
    },
    {
      id: "raccolte",
      titolo: "Raccolte",
      descrizione:
        "Opere composte da più articoli indipendenti che possono essere letti in qualsiasi ordine.",
      gradientClasses: "from-pink-400 to-pink-500",
      bgClasses: "bg-gradient-to-b from-pink-50 to-pink-100",
      icona: "📑",
      immagine: "/assets/raccolte.webp",
    },
    {
      id: "collezioni",
      titolo: "Collezioni",
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

  // Effetto per gestire il numero di slides in base alla dimensione dello schermo
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setSlidesPerView(1);
      } else if (width < 1024) {
        setSlidesPerView(2);
      } else {
        setSlidesPerView("auto");
      }
    };

    // Inizializza
    handleResize();

    // Aggiungi listener per il ridimensionamento
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Utilizzo dell'hook parallax con una configurazione semplificata
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calcola la posizione relativa dell'elemento rispetto alla finestra
      const elementCenter = rect.top + rect.height / 2;
      const windowCenter = windowHeight / 2;
      const distanceFromCenter = elementCenter - windowCenter;
      const maxDistance = windowHeight / 2 + rect.height / 2;

      // Normalizza la distanza in un valore tra -1 e 1
      const progress = Math.max(
        -1,
        Math.min(1, distanceFromCenter / maxDistance),
      );

      // Mappa il progresso a un intervallo percentuale per l'effetto parallax
      const mappedOffset = `${progress * 40}%`; // Aumentato a 40% per un effetto più evidente
      setOffset(mappedOffset);
    };

    // Chiama handleScroll immediatamente per impostare l'offset iniziale
    handleScroll();

    // Aggiungi il listener per l'evento scroll
    window.addEventListener("scroll", handleScroll);

    // Rimuovi il listener durante la pulizia
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const controls = useAnimation();
  const isInView = useInView(containerRef, { once: false, amount: 0.3 });

  // Avvia l'animazione quando il componente è visibile
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  // Varianti per l'animazione
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

  // Funzione per aggiornare gli stati di blur
  const updateBlurStates = () => {
    if (swiperRef.current) {
      const swiper = swiperRef.current;
      setShowLeftBlur(!swiper.isBeginning);
      setShowRightBlur(!swiper.isEnd);
    }
  };

  return (
    <div className="bg-background px-4 py-4 max-md:py-0 max-w-[100vw] overflow-hidden">
      <div className="relative px-4 py-6">
        {/* Contenitore principale che sarà tracciato per il parallax */}
        <div
          ref={containerRef}
          className="h-full relative max-w-[100vw] mx-auto overflow-hidden"
        >
          <div className="relative w-full max-w-[100vw]">
            {/* Pseudo-elementi per l'effetto dissolvenza ai bordi */}
            <div className="absolute inset-0 pointer-events-none z-10">
              {/* Lato Sinistro - mostrato solo se ci sono slide a sinistra */}
              {showLeftBlur && (
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10" />
              )}
              {/* Lato Destro - mostrato solo se ci sono slide a destra */}
              {showRightBlur && (
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10" />
              )}
            </div>

            {/* Swiper component */}
            <Swiper
              modules={[Navigation, EffectCreative]}
              spaceBetween={16}
              slidesPerView={slidesPerView}
              navigation
              className="!overflow-hidden"
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
                updateBlurStates();
              }}
              onSlideChange={() => updateBlurStates()}
              onResize={() => updateBlurStates()}
              onBreakpoint={() => updateBlurStates()}
              onTransitionEnd={() => updateBlurStates()}
              onAfterInit={() => updateBlurStates()}
              observer={true}
              observeParents={true}
              watchSlidesProgress={true}
            >
              {percorsi.map((percorso, index) => (
                <SwiperSlide
                  key={percorso.id}
                  className="!w-[400px]" // Larghezza fissa come richiesto
                >
                  <motion.div
                    custom={index}
                    initial="hidden"
                    animate={controls}
                    variants={cardVariants}
                    className="flex-shrink-0"
                  >
                    <div
                      className={`w-[400px] md:h-[500px] rounded-lg ${percorso.bgClasses} overflow-hidden border border-gray-200`}
                    >
                      <motion.div
                        className="flex flex-col h-full w-full overflow-hidden"
                        whileHover={{
                          scale: 1.03,
                          transition: { duration: 0.3 },
                        }}
                      >
                        {/* Contenuto della card */}
                        <div className="relative h-full">
                          {/* Immagine di sfondo con parallax - struttura modificata */}
                          <div className="absolute inset-0 w-full h-full">
                            <Image
                              src={percorso.immagine}
                              alt={percorso.titolo}
                              fill
                              className="object-cover rounded-lg"
                              style={{
                                objectPosition: `center ${offset}`,
                              }}
                            />
                          </div>

                          {/* Contenitore del contenuto - dimensione fissa */}
                          <div className="h-full w-full flex justify-center items-center z-10 relative px-6">
                            <motion.div
                              className="bg-background rounded-lg p-6 shadow-md w-full md:h-[240px] flex flex-col"
                              whileHover={{ y: -5 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <h3 className="text-xl font-bold text-gradient font-title text-center mb-4">
                                {percorso.titolo}
                              </h3>
                              <p className="text-sm sm:text-base leading-relaxed mb-6 text-gray-600 flex-grow">
                                {percorso.descrizione}
                              </p>

                              <div className="mt-auto">
                                <Link
                                  href={`/${percorso.id}/`}
                                  className="block w-full"
                                >
                                  <RainbowButton>
                                    Esplora {percorso.titolo.toLowerCase()}
                                    <motion.svg
                                      whileHover={{ x: 3 }}
                                      transition={{
                                        type: "spring",
                                        stiffness: 400,
                                      }}
                                      stroke="currentColor"
                                      fill="currentColor"
                                      strokeWidth="0"
                                      viewBox="0 0 24 24"
                                      height="1em"
                                      width="1em"
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="inline-block ml-2"
                                    >
                                      <path
                                        fill="none"
                                        d="M0 0h24v24H0z"
                                      ></path>
                                      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
                                    </motion.svg>
                                  </RainbowButton>
                                </Link>
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>

      {/* Etichetta per il mobile */}
      <div className="text-center mt-3 text-xs sm:text-sm text-gray-500 lg:hidden">
        Scorri verso destra o sinistra per navigare
      </div>
    </div>
  );
};

export default PercorsiSliderLg;
