"use client";

import { useScroll, useTransform, motion } from "framer-motion";
import dynamic from "next/dynamic";
import React, { useRef, useState, useEffect } from "react";
import { RainbowButton } from "../ui/rainbow-button";
import { useSystemTheme } from "@/hooks/useSystemTheme";
import { useTheme } from "next-themes";

// Dynamically import the Scene component
const Scene = dynamic(() => import("@/components/three-articles/Scene"), {
  ssr: false,
});

// Cycle Component
const Cycle = ({ id, title, progressRange, scrollYProgress, isActive, isLastCycle, currentImage, isDarkMode }) => {
  const cycleProgress = useTransform(scrollYProgress, progressRange, [0, 1]);

  return (
    <div
      className={`h-[600vh] ${
        isActive ? "relative" : "absolute top-0 left-0 w-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="sticky top-0 h-screen">
        {/* Header */}


        {/* Main Scene */}
        <div className="h-screen relative">
          <h1 className="w-full font-title text-gradient animated-gradient text-bold text-6xl text-center absolute top-20 z-20">Ultimi Articoli</h1>
          <Scene scrollProgress={cycleProgress} isLastCycle={isLastCycle} currentImage={currentImage} isDarkMode={isDarkMode}/>
          <div className="absolute bottom-10 flex flex-col items-center justify-center w-full z-10 gap-8">
            <p className=" text-foreground font-sans text-5xl w-full text-center z-20 py-2">{title}</p>
            <RainbowButton className="w-fit">
              Leggi Subito
            </RainbowButton>
          </div>
        </div>

        {/* Title at the Bottom */}

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
    { id: 1, title: "La donna e il pozzo", image: '/assets/test1.avif' },
    { id: 2, title: "Epistemologia della trap", image: '/assets/photo1.jpg' },
    { id: 3, title: "Racconti allucinogeni", image: '/assets/photo2.jpg' },
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
        cycles.length - 1
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
