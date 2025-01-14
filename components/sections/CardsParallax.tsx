"use client";

import Lenis from "@studio-freight/lenis";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import { useEffect, useRef } from "react";
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
    src: `/assets/${category.title}.webp`,
    url: category.href,
    color,
  };
});

const Card = ({
  i,
  title,
  description,
  src,
  url,
  color,
  progress,
  range,
  targetScale,
  opacityScale,
}) => {
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
      className="h-screen flex items-center justify-center sticky top-0"
    >
      <motion.div
        className="bg-background m-0 p-0 relative origin-top mx-4"
        style={{
          scale,
          top: `calc(${i * 15}px)`,
        }}
      >
        <motion.div
          className="flex flex-col relative max-sm:h-[500px] h-[650px] w-full max-w-[1200px] rounded-lg max-sm:p-8 p-12 py-16 max-sm:gap-4 origin-top border-gradient animated-gradient border-white border border-opacity-50"
          style={{ opacity }}
        >
          <h2 className="sm:hidden font-title text-center m-0 text-3xl max-sm:mb-4">
            {title}
          </h2>
          <div className="flex max-sm:flex-col-reverse items-center justify-center h-screen w-full">
            <div className="relative w-[100%] max-sm:px-0 px-8 md:px-16 flex flex-col">
              <h2 className="max-md:hidden font-title text-center m-0 text-3xl mb-8">
                {title}
              </h2>
              <div>
                <p className="font-sans mb-8 max-sm:line-clamp-3">
                  {description}
                </p>
                <div className="border border-black w-full rounded-xl border-opacity-50">
                  <RainbowButton>Scopri</RainbowButton>
                </div>
              </div>
            </div>

            <div className="relative h-full w-full rounded-lg overflow-hidden flex-grow max-sm:mb-8">
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
  useEffect(() => {
    const lenis = new Lenis();

    function raf(time) {
      lenis.raf(time);

      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  });

  const container = useRef(null);

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  const opacity = useTransform(scrollYProgress, [0.9999999, 1], [1, 0]);
  return (
    <main ref={container} className="h-full">
      <div className="sticky top-0 bg-background font-title text-5xl h-[20vh] text-gradient animated-gradient w-full flex items-center justify-center">
        <motion.h1 style={{ opacity }}>Categorie</motion.h1>
      </div>
      {projects.map((project, i) => {
        console.log(project.color);
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
