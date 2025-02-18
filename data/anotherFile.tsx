"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import React, { useEffect, useRef } from "react";

import Meteors from "@/components/ui/meteors";
import { RainbowButton } from "@/components/ui/rainbow-button";
import RetroGrid from "@/components/ui/retro-grid";
import { SecondaryButton } from "@/components/ui/secondary-button";
import useFadeInEffect from "@/hooks/useFadeInEffect";
import useHackerTextEffect from "@/hooks/useHackerTextEffect";
import useParticleSystems from "@/hooks/useParticleSystems";
import { useSystemTheme } from "@/hooks/useSystemTheme";

export default function Hero() {
  const { theme } = useTheme();
  const isSystemDark = useSystemTheme();
  const isDarkMode = theme === "dark" || (theme === "system" && isSystemDark);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Use the hacker effect with the target text
  const { displayText } = useHackerTextEffect("LEXOVERSE");

  // Use the fade-in effect and chain the hacker effect
  const { opacity, triggerFadeIn } = useFadeInEffect(() => {
    // Trigger hacker effect after fade-in
  });

  // Use the particle systems for the canvas animation
  const { handleMouseMove } = useParticleSystems(canvasRef, isDarkMode);

  // Trigger fade-in on mount
  useEffect(() => {
    triggerFadeIn();
  }, []);

  return (
    <section
      className="min-h-custom relative flex max-w-screen flex-col items-center justify-center overflow-x-hidden bg-background"
      onMouseMove={(e: React.MouseEvent<HTMLDivElement>) => handleMouseMove(e)}
    >
      {/* Canvas for particles */}
      <canvas
        ref={canvasRef}
        className="absolute left-0 top-0 z-0 h-full w-full"
      ></canvas>

      {/* Content */}
      <RetroGrid className="z-0" />
      <Meteors />
      <div className="z-10 w-full relative">
        {/* Title */}
        <h1
          className="font-title max-sm:text-[2.5rem] max-md:text-[3rem] md:text-6xl lg:text-7xl xl:text-8xl text-gradient animated-gradient flex justify-center items-center max-lg:flex-col-reverse max-sm:items-center max-sm:space-y-4 font-bold"
          style={{
            opacity, // Apply fade-in effect
            transition: "opacity 0.5s ease-in-out",
            fontVariantNumeric: "tabular-nums", // Enforce monospace-like numbers
            letterSpacing: "0.1em", // Simulate monospace effect for letters
          }}
        >
          {displayText || "\u00A0" /* Non-breaking space to maintain width */}
          <div className="relative max-md:w-[150px] max-md:h-[150px] max-xl:w-[200px] max-xl:h-[200px] w-[250px] h-[250px]">
            <Image
              src="/assets/mascot.png"
              layout="fill" // Fill the container
              objectFit="cover" // Maintain aspect ratio, crop excess
              className="z-50 filter invert dark:filter-none dark:invert-0"
              alt="mascot"
            />
          </div>
        </h1>

        {/* Subheading */}
        <div className="mx-6">
          <p className="font-typo-paragraph mt-6 font-color-paragraph font-sans">
            Entra nel{" "}
            <span className="font-typo-paragraph-bold">Lexoverse </span> ed
            espolora il suo{" "}
            <span className="font-typo-paragraph-bold">Universo</span>. Qui ogni
            parola è un viaggio che apre un portale per nuovi mondi. Esplora i
            nostri articoli o scrivi il tuo racconto.
          </p>

          {/* Buttons */}
          <div className="mt-12 flex w-full flex-col justify-center items-center max-sm:space-y-8 sm:flex-row sm:space-x-12">
            <div className="border-gradient rounded-xl animated-gradient p-[1px] sm:min-w-[200px] h-fit max-sm:w-full max-sm:max-w-[300px]">
              <RainbowButton
                className="h-full font-sans text-lg"
                icon="arrowDown"
              >
                Vedi i post
              </RainbowButton>
            </div>
            <div className="border-gradient rounded-xl animated-gradient p-[1px] max-sm:w-full sm:min-w-[200px] max-sm:max-w-[300px]">
              <div className="bg-background w-full h-full rounded-xl flex items-center justify-center">
                <SecondaryButton
                  icon="FaChevronDown"
                  onClick={() => alert("Clicked!")}
                  className="font-sans text-lg"
                  isDarkMode={isDarkMode}
                >
                  Pubblica con noi
                </SecondaryButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
