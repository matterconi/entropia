"use client";

import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";

import { CheckCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { useFilterContext } from "@/context/FilterContext";
import { genres } from "@/data/data";

const FilterSlider = ({ slice = "genres" }) => {
  const { filters, updatePartialFilter } = useFilterContext();
  const [selectedSlice, setSelectedSlice] = useState<string[]>(filters[slice]);
  const [isScrollable, setIsScrollable] = useState(false);
  const [swiperInstance, setSwiperInstance] = useState(null);

  // Sincronizza lo stato locale con i filtri globali
  useEffect(() => {
    setSelectedSlice(filters[slice] || []);
  }, [filters, slice]);

  const handleClick = (genre: string) => {
    const newSelection = selectedSlice.includes(genre)
      ? selectedSlice.filter((item) => item !== genre)
      : [...selectedSlice, genre];

    setSelectedSlice(newSelection);
    updatePartialFilter(slice, newSelection);
  };

  // Funzione per aggiornare lo stato di isScrollable con un piccolo delay
  const updateScrollableState = () => {
    setTimeout(() => {
      if (swiperInstance) {
        setIsScrollable(!swiperInstance.isLocked);
      }
    }, 50); // Ritarda l'aggiornamento di 50ms per evitare problemi con il fullscreen
  };

  // Aggiunge listener per Resize e Fullscreen
  useEffect(() => {
    window.addEventListener("resize", updateScrollableState);
    document.addEventListener("fullscreenchange", updateScrollableState);

    return () => {
      window.removeEventListener("resize", updateScrollableState);
      document.removeEventListener("fullscreenchange", updateScrollableState);
    };
  }, [swiperInstance]);

  return (
    <div className="relative overflow-x-hidden pr-6">
      {/* Effetto trasparenza sui lati (solo se lo slider è scrollabile) */}
      {isScrollable && (
        <>
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background via-background/70 to-transparent pointer-events-none z-10"></div>
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background via-background/70 to-transparent pointer-events-none z-10"></div>
        </>
      )}

      {/* Slider Swiper */}
      <Swiper
        modules={[Navigation, Autoplay]}
        autoplay={{
          delay: 1500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={false}
        spaceBetween={20}
        slidesPerView="auto"
        className="!overflow-hidden"
        onSwiper={(swiper) => {
          setSwiperInstance(swiper);
          setTimeout(() => {
            setIsScrollable(!swiper.isLocked);
          }, 50); // Assicura che l'aggiornamento avvenga dopo il rendering
        }}
      >
        {genres.map((category) => {
          const isSelected = selectedSlice.includes(category.title);

          return (
            <SwiperSlide
              key={category.title}
              className="!w-auto flex items-center justify-center"
            >
              <div className="dark:w-full dark:h-full border-gradient p-[1px] rounded-lg animated-gradient">
                <div className="w-full h-full bg-background rounded-lg p-1">
                  <button
                    onClick={() => handleClick(category.title)}
                    className={`cursor-pointer flex items-center justify-center rounded-lg px-2 py-1 transition-all duration-300 ${
                      isSelected ? "text-green-500" : "text-foreground"
                    }`}
                  >
                    <p className="text-xs font-semibold flex items-center justify-center w-full h-full">
                      {/* Area sinistra: icona con spazio bilanciato */}
                      <span
                        className={`transition-all duration-300 flex justify-center ${
                          isSelected ? "w-4" : "w-2"
                        }`}
                      >
                        <CheckCircle
                          size={16}
                          className={`transition-all duration-300 text-green-500 ${
                            isSelected
                              ? "opacity-100 scale-100"
                              : "opacity-0 scale-0"
                          }`}
                        />
                      </span>

                      {/* Contenuto centrale: padding dinamico */}
                      <span
                        className={`text-center transition-all duration-300 ${
                          isSelected
                            ? "pl-1 text-green-500"
                            : "px-[2px] text-foreground"
                        }`}
                      >
                        {category.title}
                      </span>

                      {/* Area destra: spazio di bilanciamento */}
                      <span className={`${isSelected ? "w-0" : "w-2"}`}></span>
                    </p>
                  </button>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default FilterSlider;
