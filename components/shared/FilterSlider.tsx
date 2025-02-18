"use client";

import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";

import { CheckCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import type { Swiper } from "swiper"; // Import the instance type
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper as SwiperReact, SwiperSlide } from "swiper/react";

import { useFilterContext } from "@/context/FilterContext";
import { genres } from "@/data/data";

interface FilterSliderProps {
  slice?: string;
}

const FilterSlider = ({ slice = "genres" }: FilterSliderProps) => {
  const { filters, updatePartialFilter } = useFilterContext();
  const [selectedSlice, setSelectedSlice] = useState<string[]>(
    Array.isArray(filters[slice]) ? filters[slice] : [],
  );
  const [isScrollable, setIsScrollable] = useState(false);
  const [swiperInstance, setSwiperInstance] = useState<Swiper | null>(null);

  // Sync local state with global filters
  useEffect(() => {
    setSelectedSlice(Array.isArray(filters[slice]) ? filters[slice] : []);
  }, [filters, slice]);

  const handleClick = (genre: string) => {
    const newSelection = selectedSlice.includes(genre)
      ? selectedSlice.filter((item) => item !== genre)
      : [...selectedSlice, genre];

    setSelectedSlice(newSelection);
    updatePartialFilter(slice, newSelection);
  };

  // Update isScrollable with a slight delay
  const updateScrollableState = React.useCallback(() => {
    setTimeout(() => {
      if (swiperInstance) {
        setIsScrollable(!swiperInstance.isLocked);
      }
    }, 50);
  }, [swiperInstance]);

  // Add listeners for resize and fullscreen changes
  useEffect(() => {
    window.addEventListener("resize", updateScrollableState);
    document.addEventListener("fullscreenchange", updateScrollableState);

    return () => {
      window.removeEventListener("resize", updateScrollableState);
      document.removeEventListener("fullscreenchange", updateScrollableState);
    };
  }, [swiperInstance, updateScrollableState]);

  return (
    <div className="relative overflow-x-hidden pr-6">
      {isScrollable && (
        <>
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background via-background/70 to-transparent pointer-events-none z-10"></div>
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background via-background/70 to-transparent pointer-events-none z-10"></div>
        </>
      )}

      <SwiperReact
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
          }, 50);
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
                      <span
                        className={`text-center transition-all duration-300 ${
                          isSelected
                            ? "pl-1 text-green-500"
                            : "px-[2px] text-foreground"
                        }`}
                      >
                        {category.title}
                      </span>
                      <span className={`${isSelected ? "w-0" : "w-2"}`}></span>
                    </p>
                  </button>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </SwiperReact>
    </div>
  );
};

export default FilterSlider;
