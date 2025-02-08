import Image from "next/image";
import React from "react";

import { categories } from "@/data/data";

interface SectionHeaderProps {
  section: number;
}

const SectionHeader = ({ section }: SectionHeaderProps) => {
  const { title, description } = categories[section];
  return (
    <div className="pt-4 bg-background max-md:px-6 px-12 w-full flex items-center justify-center">
      {/* Title */}
      <div className="relative max-md:w-screen w-full flex max-md:flex-col items-center justify-center rounded-lg border-gradient p-[1px]">
        {/* Contenitore Immagine */}
        <div className="relative md:w-[50%] md:h-[300px] h-[100px] w-full">
          <Image
            src={`/assets/${title}.webp`}
            alt="Poesia"
            fill
            className="max-md:rounded-t-lg md:rounded-l-lg object-cover object-[0px_-50px]"
          />
        </div>

        {/* Contenitore Testo */}
        <div className="md:w-[50%] md:h-[300px] flex flex-col items-center justify-center px-6 max-md:rounded-b-lg md:rounded-r-lg bg-background w-full">
          <h1 className="font-title text-4xl text-gradient animated-gradient mb-4 bg-background w-full text-center py-6">
            {title}
          </h1>
          <p className="max-md:hidden">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default SectionHeader;
