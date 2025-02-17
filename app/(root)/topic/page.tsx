"use client";

import "swiper/css";
import "./swiper.css";
import "swiper/css/navigation";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { ShinyButton } from "@/components/ui/shiny-button";
import { MenuItem, topic } from "@/data/data";

const CategoriesPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [categoriesState, setCategoriesState] = useState([null, topic[0]]);

  const [offset, setOffset] = useState("0%");
  const setCategory = (newCategory: MenuItem) => {
    setCategoriesState(([_, current]) => [current, newCategory]); // Aggiorna prev con current e current con il nuovo valore
  };
  const isFinished = false;

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate how far the container is in the viewport
      const progress = Math.min(Math.max(0, 1 - rect.bottom / windowHeight), 1);

      // Map progress to a desired range (e.g., "0%" to "100%")
      const mappedOffset = `${progress * 50}%`;
      setOffset(mappedOffset);
    };

    // Call handleScroll immediately to set the initial offset
    handleScroll();

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Remove listener on cleanup
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isFinished) {
    return (
      <h1 className="text-center text-gradient font-title text-4xl p-4 flex items-center justify-center h-screen mt-[-65px]">
        Work in progress
      </h1>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-4 w-full">
      {/* Categoria in Evidenza */}
      <h1 className="mb-6 w-full font-title max-sm:text-[2.5rem] max-md:text-[3rem] md:text-6xl lg:text-7xl xl:text-7xl text-center flex justify-center items-center font-bold gap-4 max-lg:flex-col-reverse lg:mt-8">
        <span className="text-gradient animated-gradient py-2">Topic</span>
      </h1>
      <div
        className="border-gradient animated-gradient p-[1px] rounded-lg mb-8 max-w-5xl mx-auto"
        ref={containerRef}
      >
        <div className="w-full h-full bg-background rounded-lg overflow-hidden">
          <div className="w-full h-full relative max-w-5xl mx-auto">
            {/* Title */}
            <div className="bg-background relative h-full w-full flex flex-col items-center justify-center max-md:py-24 py-36">
              <div className="bg-background w-fit h-fit flex justify-center items-center z-50 rounded-lg mx-4">
                <motion.h1
                  key={categoriesState[1]?.title} // Chiave dinamica per attivare l'animazione
                  initial={{ opacity: 0, y: "-20%" }} // Partenza invisibile e leggermente sopra
                  animate={{ opacity: 1, y: "0%" }} // Arrivo visibile e centrato
                  transition={{
                    duration: 1, // Durata dell'animazione
                    ease: "easeInOut", // Transizione fluida
                  }}
                  className="flex w-fit h-fit z-50 font-title text-4xl text-center p-4 md:py-8 rounded-lg text-gradient animated-gradient px-8 md:px-12"
                >
                  {categoriesState[1]?.title}
                </motion.h1>
              </div>
            </div>

            {/* Immagine Statica con dissolvenza */}
            {/* Immagine Statica */}
            {categoriesState[0] && (
              <motion.div
                key={`static_${categoriesState[0]?.title}`} // Chiave basata sulla categoria precedente
                initial={{ opacity: 1 }} // Completamente visibile all'inizio
                animate={{ opacity: 0 }} // Dissolvenza graduale verso invisibilità
                transition={{
                  duration: 1.5, // Durata della dissolvenza
                  ease: "easeInOut",
                }}
                className="absolute inset-0 w-full h-full z-10"
              >
                <Image
                  src={`/assets/${categoriesState[0].title.toLowerCase()}.webp`}
                  alt={categoriesState[0].title}
                  fill
                  className="rounded-t-lg object-cover z-10"
                  style={{
                    objectPosition: `center ${offset}`, // Posizione dinamica
                  }}
                />
              </motion.div>
            )}

            {/* Immagine Dinamica */}
            {categoriesState[0] && categoriesState[1] && (
              <motion.div
                key={`dynamic_${categoriesState[1]?.title}`} // Chiave dinamica basata sulla nuova immagine
                initial={{ opacity: 0, y: "-100%" }} // Partenza invisibile e sopra
                animate={{ opacity: 1, y: "0%" }} // Arrivo visibile e centrato
                transition={{
                  duration: 0.8,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 w-full h-full z-30"
              >
                <Image
                  src={`/assets/${categoriesState[1]?.title.toLowerCase()}.webp`}
                  alt={categoriesState[1]?.title}
                  fill
                  className="rounded-t-lg object-cover z-20"
                  style={{
                    objectPosition: `center ${offset}`, // Posizione dinamica
                  }}
                />
              </motion.div>
            )}

            {!categoriesState[0] && categoriesState[1] && (
              <Image
                src={`/assets/${categoriesState[1]?.title.toLowerCase()}.webp`}
                alt={categoriesState[1]?.title}
                fill
                className="rounded-t-lg object-cover z-20"
                style={{
                  objectPosition: `center ${offset}`, // Posizione dinamica
                }}
              />
            )}
          </div>

          {/* Description */}
          <p className="m-8 px-6 max-w-5xl mx-auto z-30 relative">
            {categoriesState[1]?.description}
          </p>

          {/* Button */}
          <div className="flex justify-center w-full pb-6 z-30 relative">
            <div className="w-fit h-fit border-gradient animated-gradient p-[1px] rounded-lg">
              <div className="w-fit h-fit bg-background rounded-lg">
                <Link
                  href={`/categorie/${categoriesState[1]?.title.toLowerCase()}}`}
                >
                  <ShinyButton className="font-sans font-semibold">
                    <p className="text-gradient text-lg">Leggimi</p>
                  </ShinyButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Slider delle Categorie */}
      <div className="w-full h-full relative max-w-5xl mx-auto overflow-hidden">
        <div className="relative w-full">
          {/* Contenitore Slider con Effetto Opaco */}
          <div className="relative w-full">
            {/* Pseudo-elementi per l'effetto dissolvenza */}
            <div className="absolute inset-0 pointer-events-none z-10">
              {/* Lato Sinistro */}
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10" />
              {/* Lato Destro */}
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10" />
            </div>

            {/* Slider */}
            <Swiper
              modules={[Navigation]}
              spaceBetween={20}
              slidesPerView="auto"
              navigation
              className="!overflow-visible"
            >
              {topic.map((category) => (
                <SwiperSlide
                  key={category.title}
                  className="!w-[250px]" // Le slide si adattano dinamicamente
                >
                  <button
                    className="flex flex-col items-center justify-center p-4 rounded-lg shadow-lg h-[150px] w-full"
                    onClick={() => setCategory(category)}
                  >
                    <p className="mt-2 text-sm font-semibold z-30 bg-background p-2 rounded-lg">
                      {category.title}
                    </p>

                    <Image
                      src={`/assets/${category.title.toLowerCase()}.webp`}
                      alt={category.title}
                      fill
                      className="rounded-lg object-cover"
                      style={{
                        objectPosition: `center ${offset}`, // Posizione dinamica
                      }}
                    />
                  </button>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
      <h1 className="mt-8 mb-6 w-full font-title max-sm:text-[2.5rem] max-md:text-[3rem] md:text-6xl lg:text-7xl xl:text-7xl text-center flex justify-center items-center font-bold gap-4 max-lg:flex-col-reverse lg:mt-8">
        <span className="text-gradient animated-gradient py-2">
          {`Articoli in  ${categoriesState[1]?.title}`}{" "}
        </span>
      </h1>
    </div>
  );
};

export default CategoriesPage;
