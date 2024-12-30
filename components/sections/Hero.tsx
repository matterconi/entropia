"use client";

import { useTheme } from "next-themes";
import React, { useEffect, useRef } from "react";

import Meteors from "@/components/ui/meteors";
import { RainbowButton } from "@/components/ui/rainbow-button";
import RetroGrid from "@/components/ui/retro-grid";
import useFadeInEffect from "@/hooks/useFadeInEffect";
import useHackerTextEffect from "@/hooks/useHackerTextEffect";
import useParticleSystems from "@/hooks/useParticleSystems";
import { useSystemTheme } from "@/hooks/useSystemTheme";

import { SecondaryButton } from "../ui/secondary-button";

export default function Hero() {
  const { theme } = useTheme();
  const isSystemDark = useSystemTheme();
  const isDarkMode = theme === "dark" || (theme === "system" && isSystemDark);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Use the hacker effect with the target text
  const { displayText, triggerHackerEffect } = useHackerTextEffect("ENTROPIA");

  // Use the fade-in effect and chain the hacker effect
  const { opacity, triggerFadeIn } = useFadeInEffect(() => {
    triggerHackerEffect(); // Trigger hacker effect after fade-in
  });

  // Use the particle systems for the canvas animation
  const { handleMouseMove } = useParticleSystems(canvasRef, isDarkMode);

  // Trigger fade-in on mount
  useEffect(() => {
    triggerFadeIn();
  }, []);

  const handleHover = () => {
    triggerHackerEffect(); // Retrigger the hacker effect on hover
  };

  return (
    <section
      className="min-h-custom relative flex w-screen flex-col items-center justify-center overflow-x-hidden"
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
      <div className="z-10 w-full text-center">
        {/* Title */}
        <h1
          className="font-title font-typo-h1 text-gradient animated-gradient"
          style={{
            opacity, // Apply fade-in effect
            transition: "opacity 0.5s ease-in-out",
          }}
          onMouseOver={handleHover} // Trigger hacker effect and reset interval on hover
        >
          {displayText || "\u00A0" /* Non-breaking space to maintain width */}
        </h1>

        {/* Subheading */}
        <div className="mx-6">
          <p className="font-typo-paragraph mt-6 font-color-paragraph font-sans">
            Esplora il confine tra{" "}
            <span className="font-typo-paragraph-bold">caos </span> e{" "}
            <span className="font-typo-paragraph-bold">ordine</span>, dove ogni
            parola è un viaggio e ogni storia è un universo da scoprire. Il{" "}
            <span className="font-typo-paragraph-bold">caos </span> è solo
            l&apos;inizio.
          </p>

          {/* Buttons */}
          <div className="mt-12 flex w-full flex-col justify-center max-md:space-y-8 sm:flex-row sm:space-x-12">
            <RainbowButton className="h-full font-sans text-lg">
              Vedi i post
            </RainbowButton>
            <SecondaryButton
              icon="FaChevronDown"
              onClick={() => alert("Clicked!")}
              className="font-sans text-lg"
              isDarkMode={isDarkMode}
            >
              Scopri di più
            </SecondaryButton>
          </div>
        </div>
      </div>
    </section>
  );
}
