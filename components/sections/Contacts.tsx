"use client";

import React from "react";

import RainbowInput from "../forms/RainbowInput";
import LocalSearch from "../post-page/LocalSearch";
import FlickeringGrid from "../ui/flickering-grid";
import { RainbowButton } from "../ui/rainbow-button";
import { SecondaryButton } from "../ui/secondary-button";
import ShimmerButton from "../ui/shimmer-button";

const Contacts = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  return (
    <div className="relative h-screen rounded-lg w-full overflow-hidden flex flex-col items-center z-10">
      <FlickeringGrid
        className="z-0 absolute inset-0 [mask-image:radial-gradient(450px_circle_at_center,white,transparent)] w-full"
        squareSize={4}
        gridGap={6}
        color="#60A5FA"
        maxOpacity={0.5}
        flickerChance={0.1}
        height={height}
        width={width}
      />
      <h1 className="text-gradient font-title max-sm:text-[2.5rem] max-md:text-[3rem] md:text-6xl lg:text-7xl xl:text-8xl p-8 text-center mt-24 mb-12 font-semibold">
        Contatti
      </h1>
      <div className="px-4 sm:px-16 w-full flex flex-col items-center justify-center z-10">
        <ShimmerButton className="z-10 w-full h-[450px] rounded-none">
          <h1 className="text-7xl max-sm:text-5xl z-20 text-foreground font-title mb-4 flex flex-col justify-center items-center w-full">
            Entra in
            <br /> <span className="text-gradient">Versia</span>
          </h1>
          <p className="4 max-sm:px-4 px-16 z-20 text-sm mb-8  break-words w-full text-center text-foreground">
            Iscriviti alla Newsletter per rimanere sempre aggiornat3 sulle
            novità del sito!
          </p>
          <div className="w-full z-30 mb-4 max-sm:px-4 px-16 flex justify-center items-center">
            <RainbowInput placeholder="email" otherClasses="w-full" />
          </div>
          <div className="border-gradient rounded-xl animated-gradient p-[1px] lg:max-w-[56px] xl:min-w-[150px] xl:max-w-[200px] mt-4 sm:mt-6 md:mt-8">
            <div className="bg-background w-full rounded-xl flex items-center justify-center h-[56px]">
              <SecondaryButton className="font-sans text-lg">
                <p className="font-semibold text-gradient">Iscriviti</p>
              </SecondaryButton>
            </div>
          </div>
        </ShimmerButton>
      </div>
    </div>
  );
};

export default Contacts;
