"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import React, { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { RainbowInput } from "@/components/ui/rainbow-input";

interface LocalSearchProps {
  placeholder: string;
  otherClasses?: string;
}

const LocalSearch = ({ placeholder, otherClasses }: LocalSearchProps) => {
  return (
    <div className="relative w-full max-w-3xl">
      <div className="relative z-40 border-gradient animated-gradient p-[1px] rounded-md">
        <RainbowInput className="w-full flex h-[54px] grow flex-1 items-center gap-4 rounded-md px-4 bg-background hover:!bg-background focus:!bg-background">
          <Input
            type="text"
            placeholder={placeholder}
            className={`h-fit no-focus w-full rounded-md border-none shadow-none outline-none focus:outline-none focus-visible:outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 ${otherClasses}`}
          />
        </RainbowInput>
      </div>
    </div>
  );
};

export default LocalSearch;
