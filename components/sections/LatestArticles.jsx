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
  const sizeRef = useRef({ width: 0, height: 0 });
  const sideRef = useRef(null);
  const sideDistanceRef = useRef(null);
  const topMidScreenRef = useRef(null);
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

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Listener for window resize to detect breakpoints
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Determine styles based on the breakpoint
  const isLargeScreen = windowWidth >= 1280; // Example breakpoint for `max-lg`
  const dynamicStyles = isLargeScreen
    ? {
        position: "absolute",
        top: `${topRef.current}px`,
        width: `${sizeRef.current.width}px`,
        height: `${height}px`,
        left: `calc(50% - ${sideDistanceRef.current}px)`, // Center the element
      }
    : {
        position: "absolute",
        top: `${topMidScreenRef.current / 2}px`, // Adjust for smaller screens
        width: `${width}px`, // Scale down width
        height: `${sizeRef.current.height }px`, // Scale down height
      };

  useEffect(() => {
    if (imageRef.current && width && height) {
      sizeRef.current.width = sizeRef.current.width === 0 ? width : sizeRef.current.width;
      sizeRef.current.height = sizeRef.current.height === 0 ? height : sizeRef.current.height;
      const bottom = imageRef.current.getBoundingClientRect().bottom;
      const top = imageRef.current.getBoundingClientRect().top;
      const left = imageRef.current.getBoundingClientRect().left;
      const right = imageRef.current.getBoundingClientRect().right;
      const sideDistance = (right - left - width) / 2;
      sideDistanceRef.current = sideDistance;
      sideRef.current = (right - (sideDistance * 2));
      const distance = (bottom - top - height) / 2;
      const distanceFromTop = distance;
      topRef.current = distanceFromTop;
      topMidScreenRef.current = distance * 2 + height * 2;
    }
  }, [imageRef, height, width]);

  return (
    <div
      className={`h-[600vh] ${
        isActive
          ? "relative"
          : "absolute top-0 left-0 w-full opacity-0 pointer-events-none"
      }`}
    > 
      {/* Individual Cycle with sticky positionin */}
      <div className="sticky top-0 h-screen overflow-hidden">
         {/* Relative Cycle with absolute positionin */}
        <div className="h-screen ">
          {/* Header */}
          <div
            className="w-full absolute z-20 h-[25vh] flex flex-col "
          >
            <h1 className="px-12 w-full font-title text-gradient animated-gradient font-semibold max-sm:text-[2rem] max-md:text-[2.5rem] md:text-5xl lg:text-6xl xl:text-7xl flex justify-center items-center h-full text-center">
              Novità dal Lexoverse
            </h1>
          </div>
          {/*Content */}
          <div
            className="absolute top-[25vh] h-[65vh] w-full"
            style={{
              transform: `translateX(${isLargeScreen ? sideDistanceRef.current : 0}px)
              `,
            }}
          >
            <div className="absolute h-full w-full">
              <Background
                scrollProgress={cycleProgress}
                isLastCycle={isLastCycle}
                currentImage={currentImage}
                isDarkMode={isDarkMode}
              />
            </div>
            <div className="absolute h-full w-full z-10 flex max-xl:flex-col">
              <div className="w-full xl:w-[50%] h-full" ref={imageRef} >
                <Scene
                  scrollProgress={cycleProgress}
                  isLastCycle={isLastCycle}
                  currentImage={currentImage}
                  isDarkMode={isDarkMode}
                  isLargeScreen={isLargeScreen}
                  id={id}
                />
              </div>
              <div className="h-full z-50 w-full xl:w-[50%] flex flex-col justify-center items-center">
                <div
                  className="max-xl:rounded-b-lg xl:rounded-r-lg flex flex-col border-gradient p-[1px] max-xl:pt-0 xl:pl-0"
                  style={dynamicStyles}
                >
                  <div className="flex max-xl:justify-center justify-start items-start xl:items-center w-full h-full dark:bg-white bg-gray-50 max-xl:rounded-b-lg xl:rounded-r-lg">
                    <div className="flex flex-col max-xl:items-center justify-start items-start xl:justify-center px-8 py-6"
                    style={{
                      width: `${sizeRef.current.width}px`,
                      height: `${sizeRef.current.height}px`,
                    }}
                     >
                      <p className="relative text-black font-sans text-2xl font-semibold w-full z-20 mb-6 mt-8 max-xl:text-center">
                        {title}
                      </p>
                      <p
                        className="flex flex-wrap text-wrap text-black truncate text-ellipsis w-full max-md:line-clamp-2 max-xl:line-clamp-2 xl:line-clamp-5"
                      >
                        In un mondo alienato, in cui il piacere è estremizzato e il gioco virtuale,
                        non basta più la natura a portare alla felicità, ma è necessaria la
                        pervesione. La perversione del gioco è la fuoriuscita delle pulsioni
                        sessuali non appagate e frustrate dell'individuo che in sadismo controllato
                        credono di poter essere soddisfatte. 
                      </p>

                      <div className="flex flex-wrap gap-2 mt-6 justify-start items-start max-md:justify-center w-full">
                        {tags.map((tag, i) => (
                          <Tag key={i} tag={tag} />
                        ))}
                      </div>
                      <div className="flex justify-center w-full">
                      <RainbowButton className="mt-2 w-fit">Leggi</RainbowButton>
                      </div>
                    </div>
                  </div>
                </div>
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
    { id: 2, title: "La donna e il pozzo", image: "/assets/donna.webp" },
    { id: 3, title: "La donna e il pozzo", image: "/assets/occhi.webp" },
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
