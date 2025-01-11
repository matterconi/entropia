"use client";
import Lenis from "@studio-freight/lenis";
import { motion, useScroll, useTransform } from "framer-motion";
import React, { memo, useEffect, useMemo, useRef, useState } from "react";

import { categories, MenuItem } from "@/data/data";

import styles from "./Categorie.module.scss";
import { RainbowButton } from "../ui/rainbow-button";
import Intermezzo from "./intermezzo/Intermezzo";

interface CardProps {
  title: string;
  description: string;
  href: string;
  randomStyles: Record<string, string | number>;
}

// Shuffle logic memoized
const useShuffledCategories = (categories: MenuItem[], index: number) =>
  useMemo(() => {
    const length = categories.length;
    const step = index + 3;

    const slicedPart = categories.slice(step % length);
    const remainingPart = categories.slice(0, step % length);

    return [...slicedPart, ...remainingPart, ...slicedPart, ...remainingPart];
  }, [categories, index]);

const generateRandomStyles = () => {
  return {
    animationDuration: `${Math.random() * 2 + 3}s`,
    animationDelay: `${Math.random() * 2}s`,
    animationDirection: Math.random() > 0.5 ? "normal" : "reverse",
    backgroundSize: `${Math.random() * 100 + 150}% ${Math.random() * 100 + 150}%`,
  };
};

export default function Home({ isGeneriInView }: { isGeneriInView: boolean }) {
  const container = useRef<HTMLDivElement>(null);
  const gallery = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLDivElement>(null);
  const [bottomPosition, setBottomPosition] = useState<number | null>(null);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });
  const [columns, setColumns] = useState(4);
  const [zIndex, setZIndex] = useState(50);

  const isGeneriInViewRef = useRef(isGeneriInView);

  // Update the ref when prop changes without causing re-renders
  useEffect(() => {
    isGeneriInViewRef.current = isGeneriInView;
  }, [isGeneriInView]);

  const { scrollYProgress } = useScroll({
    target: gallery,
    offset: ["start end", "end start"],
  });

  const { height } = dimension;

  const motionValues = [
    useTransform(scrollYProgress, [0, 1], [0, height * 2]),
    useTransform(scrollYProgress, [0, 1], [0, height * 3.3]),
    useTransform(scrollYProgress, [0, 1], [0, height * 1.25]),
    useTransform(scrollYProgress, [0, 1], [0, height * 2.75]),
  ];

  const scrollY = useScroll();

  const handleScroll = () => {
    if (title.current) {
      const rect = title.current.getBoundingClientRect();
      if (rect.top === 0) {
        setBottomPosition(rect.bottom);
      }
    }

    // Update styles directly to prevent re-renders
    if (title.current) {
      // Set transition for smooth animation
      title.current.style.transition = "transform 0.5s ease-in-out";
      // Update transform based on isGeneriInViewRef
      title.current.style.transform = isGeneriInViewRef.current
        ? "translateY(-200px)"
        : "translateY(0)";
    }
  };

  const { scrollYProgress: scrollYProgressOpacity } = useScroll({
    target: container,
    offset: ["end end", "end 0.15"],
  });

  console.log(scrollYProgressOpacity.get());

  const opacity = useTransform(scrollYProgressOpacity, [0, 0.9], [1, 0]);

  useEffect(() => {
    const lenis = new Lenis();

    const raf = (time: number) => {
      lenis.raf(time);
      handleScroll(); // Update on every frame
      requestAnimationFrame(raf);
    };

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setDimension({ width, height });

      // Dynamically set the number of columns based on screen width
      if (width < 640) {
        setColumns(1); // Mobile
        document.documentElement.style.setProperty("--columns", "1");
      } else if (width < 1024) {
        setColumns(2); // Tablet
        document.documentElement.style.setProperty("--columns", "2");
      } else if (width < 1440) {
        setColumns(3); // Small Desktop
        document.documentElement.style.setProperty("--columns", "3");
      } else {
        setColumns(4); // Large Desktop
        document.documentElement.style.setProperty("--columns", "4");
      }
    };

    // Initialize RAF for smooth scrolling
    requestAnimationFrame(raf);

    // Set initial dimensions and columns
    resize();

    // Attach resize and scroll event listeners
    window.addEventListener("resize", resize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", resize);
      lenis.destroy(); // Clean up Lenis instance
    };
  }, []);

  return (
    <>
      <div className={`absolute top-0 bg-background h-fit w-full z-${zIndex}`}>
        <main className="sticky top-0">
          <Intermezzo position={bottomPosition} setZIndex={setZIndex} />
        </main>
      </div>
      <motion.main
        className="bg-background z-30 px-8 sticky top-0"
        ref={container}
        style={{ opacity }}
      >
        <motion.div
          ref={title}
          className={`text-6xl sticky top-0 z-20 bg-background flex justify-center items-center h-full transition-opacity duration-500`}
        >
          <h1 className="text-gradient font-title font-5xl p-8 text-center">
            Categorie
          </h1>
        </motion.div>
        <div ref={gallery} className={styles.gallery}>
          {Array.from({ length: columns }).map((_, i) => (
            <Column key={i} y={motionValues[i]} i={i} />
          ))}
        </div>
      </motion.main>
    </>
  );
}

const Column = ({ y, i }) => {
  const shuffledCategories = useShuffledCategories(categories, i);
  const randomStyles = useMemo(
    () => shuffledCategories.map(() => generateRandomStyles()),
    [shuffledCategories],
  );

  return (
    <motion.div className={styles.column} style={{ y }}>
      {shuffledCategories.map((category, i) => (
        <Card
          key={i}
          title={category.title}
          description={category.description}
          href={category.href}
          randomStyles={randomStyles[i]}
        />
      ))}
    </motion.div>
  );
};

const Card = memo(({ title, description, href, randomStyles }: CardProps) => {
  return (
    <div
      className="border border-black dark:border-white border-gradient animated-gradient min-h-[300px] text-foreground rounded-lg shadow-lg p-6 transition-transform duration-300 flex flex-col justify-end"
      style={randomStyles}
    >
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-sm mb-4">{description}</p>
      </div>
      <div className="flex w-full">
        <RainbowButton className="py-4 w-full">Esplora</RainbowButton>
      </div>
    </div>
  );
});
