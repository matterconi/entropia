"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useRef } from "react";
import React from "react";

import { categories } from "@/data/data";

import { RainbowButton } from "../ui/rainbow-button";

const isDarkMode =
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

const baseHue = Math.floor(Math.random() * 360); // Base hue for a consistent color family
const baseSaturation = 60; // Fixed saturation for vibrant colors
const shadesCount = categories.length; // Number of shades needed

const projects = categories.map((category, i) => {
  const lightness = isDarkMode
    ? 10 + i * (40 / shadesCount) // Dark mode: range 10% to 50% lightness
    : 60 + i * (30 / shadesCount); // Light mode: range 60% to 90% lightness

  const color = `hsl(${baseHue}, ${baseSaturation}%, ${lightness}%)`;

  return {
    title: category.title,
    description: category.description,
    src: `/assets/${category.title.toLowerCase()}.webp`,
    url: category.href,
    color,
  };
});

interface CardProps {
  i: number;
  title: string;
  description: string;
  src: string;
  url: string;
  color: string;
  progress: any;
  range: number[];
  targetScale: number;
  opacityScale: number;
}

const Card = ({
  i,
  title,
  description,
  src,
  progress,
  range,
  targetScale,
  opacityScale,
}: CardProps) => {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start end", "start start"],
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [2, 1]);
  const scale = useTransform(progress, range, [1, targetScale]);
  const opacity = useTransform(progress, range, [1, opacityScale]);

  return (
    <div
      ref={container}
      className="flex items-center justify-center sticky top-[20vh]"
    >
      <motion.div
        className="bg-background m-0 p-0 relative origin-top mx-4"
        style={{
          scale,
          top: `calc(${i * 15}px)`,
        }}
      >
        <motion.div
          className="flex flex-col relative max-sm:h-[60vh] h-[67vh] w-full max-w-[1200px] rounded-lg max-md:p-8 p-12 py-16 max-md:py-6 max-sm:gap-4 origin-top border-gradient animated-gradient border-white border border-opacity-50 "
          style={{ opacity }}
        >
          <motion.h2 className="sm:hidden font-title text-center m-0 text-3xl max-sm:mb-2">
            {title}
          </motion.h2>
          <div className="flex max-sm:flex-col-reverse items-center justify-center h-screen w-full">
            <div className="relative w-[100%] max-sm:px-0 px-8 lg:px-16 flex flex-col">
              <h2 className="max-sm:hidden font-title text-center m-0 max-md:text-3xl md:text-4xl lg:text-5xl mb-8">
                {title}
              </h2>
              <div>
                <p className="font-sans mb-8 max-md:mb-4 max-sm:line-clamp-2">
                  {description}
                </p>
                <div className="border border-black w-full rounded-xl border-opacity-50">
                  <Link href={`/categorie/${title.toLowerCase()}`}>
                    <RainbowButton>Scopri</RainbowButton>
                  </Link>
                </div>
              </div>
            </div>

            <div className="relative h-full w-full rounded-lg overflow-hidden flex-grow max-sm:mb-8 min-h-[150px]">
              <motion.div
                className="w-full h-full"
                style={{ scale: imageScale }}
              >
                <Image
                  fill
                  src={`${src}`}
                  alt="image"
                  className="object-cover object-top"
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default function Home() {
  const container = useRef(null);

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  const { scrollYProgress: titleProgress } = useScroll({
    target: container, // Element to track
    offset: ["start end", "start start"], // Trigger when at the top
  });

  const opacity = useTransform(titleProgress, [0, 1], [0, 1]);
  const opacityDiv = useTransform(scrollYProgress, [0.999999, 1], [1, 0]);

  return (
    <main ref={container} className="h-full">
      <motion.div
        className="sticky top-0 w-full flex items-center justify-center "
        style={{ opacity: opacityDiv }}
      >
        <motion.div
          className="h-full w-full flex items-center justify-center"
          style={{ opacity }}
        >
          <motion.h1 className="text-gradient font-title max-sm:text-[2.5rem] max-md:text-[3rem] md:text-6xl lg:text-7xl xl:text-8xl text-center font-semibold max-md:h-[20vh] h-[30vh] mt-16">
            Categorie
          </motion.h1>
        </motion.div>
      </motion.div>
      {projects.map((project, i) => {
        const targetScale = 1 - (projects.length - i) * 0.05;
        const opacityScale = 0.1 + 1 - (projects.length - i) * 0.1;
        return (
          <Card
            key={`p_${i}`}
            i={i}
            {...project}
            progress={scrollYProgress}
            range={[i * (1 / projects.length), 1]}
            targetScale={targetScale}
            opacityScale={opacityScale}
          />
        );
      })}
    </main>
  );
}
