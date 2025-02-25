import React from "react";

import InfiniteMovingCards from "@/components/ui/infinite-moving-cards";
import { genres, topic } from "@/data/data";

const Generi = () => {
  return (
    <div className="bg-background min-h-screen relative w-screen">
      {/* Centered Cards */}
      <h1 className="text-gradient font-title max-sm:text-[2.5rem] max-md:text-[3rem] md:text-6xl lg:text-7xl xl:text-8xl p-8 text-center mt-32 font-semibold">
        Generi
      </h1>
      <div className="mt-16 flex flex-col gap-4 items-center justify-center w-full ">
        <InfiniteMovingCards items={genres} direction="right" speed="slow" />
      </div>
      <h1 className="text-gradient font-title max-sm:text-[2.5rem] max-md:text-[3rem] md:text-6xl lg:text-7xl xl:text-8xl p-8 text-center mt-16 font-semibold">
        Topic
      </h1>
      <div className="mt-16 flex flex-col gap-4 items-center justify-center w-full ">
        <InfiniteMovingCards items={topic} direction="left" speed="slow" />
      </div>
    </div>
  );
};

export default Generi;
