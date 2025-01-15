"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import React, { useContext, useEffect, useRef, useState } from "react";

import { DimensionsContext } from "@/context/DimensionsContext";
import { useSystemTheme } from "@/hooks/useSystemTheme";

import { RainbowButton } from "../ui/rainbow-button";

// Dynamically import the Scene component
const Scene = dynamic(() => import("@/components/three-articles/Scene"), {
  ssr: false,
});
const Background = dynamic(
  () => import("@/components/three-articles/Background"),
  {
    ssr: false,
  },
);

const tags = ["Poesia", "Romantico"];

const Tag = ({ tag }) => {
  return (
    <div className="bg-green-700 text-foreground text-xs px-2 py-1 rounded-full mr-2 ">
      {tag}
    </div>
  );
};

// Cycle Component
const Cycle = ({
  id,
  title,
  progressRange,
  scrollYProgress,
  isActive,
  isLastCycle,
  currentImage,
  isDarkMode,
}) => {
  const imageRef = useRef(null);
  const bottomRef = useRef(null);
  const headerRef = useRef(null);
  const topRef = useRef(null);
  const cycleProgress = useTransform(scrollYProgress, progressRange, [0, 1]);
  const { dimensions } = useContext(DimensionsContext);
  // Find dimensions for the given ID
  const modelDimensions = dimensions.find((item) => item.id === id) || {
    width: 0,
    height: 0,
  };
  const { width, height } = modelDimensions;

  const y = 0;
  const x = 0;

  useEffect(() => {
    let headerTop = 0;
    let headerBottom = 0;
    if (headerRef.current) {
      headerBottom = headerRef.current.getBoundingClientRect().bottom;
      headerTop = headerRef.current.getBoundingClientRect().top;
    }

    if (imageRef.current) {
      const bottom = imageRef.current.getBoundingClientRect().bottom;
      const top = imageRef.current.getBoundingClientRect().top;

      const distance = (bottom - top - height) / 2;
      const distanceFromTop = top + distance - headerBottom + height;
      topRef.current = distanceFromTop;
    }
  }, [imageRef, height]);

  return (
    <div
      className={`h-[600vh] ${
        isActive
          ? "relative"
          : "absolute top-0 left-0 w-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="h-screen relative">
          <div
            className="w-full absolute z-20 h-[20vh] flex flex-col items-center justify-center"
            ref={headerRef}
          >
            <h1 className="w-full font-title text-gradient animated-gradient font-semibold max-sm:text-[2.5rem] text-[5rem] text-center">
              Le Novità
            </h1>
          </div>
          <div className="absolute top-[20vh] h-[80vh] w-full">
            <Background
              scrollProgress={cycleProgress}
              isLastCycle={isLastCycle}
              currentImage={currentImage}
              isDarkMode={isDarkMode}
            />
          </div>
          <div className="absolute top-[20vh] h-[80vh] flex flex-col items-center justify-center w-full z-10">
            <div className="w-full h-full" ref={imageRef}>
              <Scene
                scrollProgress={cycleProgress}
                isLastCycle={isLastCycle}
                currentImage={currentImage}
                isDarkMode={isDarkMode}
                id={id}
              />
            </div>
            <div className="h-[80vh] z-50">
              <div
                className="rounded-b-lg flex flex-col items-center justify-center transform -translate-x-1/2"
                style={{
                  position: "absolute",
                  top: `${topRef.current}px`,
                  width: `${width}px`,
                  height: `${height}px`,
                  backgroundColor: "rgb(254 242 242)", // Tailwind's `bg-red-50` equivalent
                }}
              >
                <p className="relative text-black font-sans text-2xl font-semibold w-full text-center z-20 mb-2 mt-8">
                  {title}
                </p>
                <p className="text-black mx-2">
                  In un mondo alienato, in cui il piacere è estremizzato e il
                  gioco virtuale, non basta più la natura a portare alla
                  felicità, ma è necessaria la pervesione. La perversione del
                  gioco è la fuoriuscita delle pulsioni sessuali non appagate e
                  frustrate dell'individuo che in sadismo controllato credono di
                  poter essere soddisfatte.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, i) => (
                    <Tag key={i} tag={tag} />
                  ))}
                </div>
                <RainbowButton className="mt-4 w-fit">Leggi</RainbowButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Home Component
const Home = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const { theme } = useTheme();
  const isSystemDark = useSystemTheme();
  const isDarkMode = theme === "dark" || (theme === "system" && isSystemDark);

  const cycles = [
    { id: 1, title: "La donna e il pozzo", image: "/assets/occhi.webp" },
    { id: 2, title: "Epistemologia della trap", image: "/assets/photo1.jpg" },
    { id: 3, title: "La perversione del gioco", image: "/assets/occhi.webp" },
  ];

  const progressRanges = cycles.map((_, index) => [
    index / cycles.length, // Start of range
    (index + 1) / cycles.length, // End of range
  ]);

  const [currentCycle, setCurrentCycle] = useState(0);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (progress) => {
      const newCycleIndex = Math.min(
        Math.floor(progress * cycles.length),
        cycles.length - 1,
      );

      if (newCycleIndex !== currentCycle) {
        setCurrentCycle(newCycleIndex);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [scrollYProgress, currentCycle, cycles.length]);

  return (
    <main className="z-10 relative top-0 bg-background text-foreground z-100">
      <div ref={containerRef} className="h-[600vh] relative">
        {cycles.map((cycle, index) => (
          <Cycle
            key={cycle.id}
            id={cycle.id}
            title={cycle.title}
            progressRange={progressRanges[index]} // Progress range for this cycle
            scrollYProgress={scrollYProgress} // Overall scroll progress
            isActive={index === currentCycle} // Only render the active cycle
            isLastCycle={index === cycles.length - 1} // Indicate if it's the last cycle
            currentImage={cycle.image}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>
    </main>
  );
};

export default Home;
