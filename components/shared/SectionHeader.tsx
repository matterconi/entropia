import Image from "next/image";
import React from "react";

import { MenuItem } from "@/data/data";

interface SectionHeaderProps {
  section: number;
  type: MenuItem[];
}

const SectionHeader = ({ section, type }: SectionHeaderProps) => {
  const { title, description } = type[section];
  return (
    <h1 className="mt-8 mb-8 w-full font-title max-sm:text-[2.5rem] max-md:text-[3rem] md:text-6xl lg:text-7xl xl:text-7xl text-center flex justify-center items-center font-bold gap-4 max-lg:flex-col-reverse lg:mt-8 px-4">
      <span className="text-gradient animated-gradient py-4">
        Novità in {title}
      </span>
    </h1>
  );
};

export default SectionHeader;
