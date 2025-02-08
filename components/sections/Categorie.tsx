"use client";

import Lenis from "@studio-freight/lenis";
import { motion, MotionValue, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import React, { memo, useEffect, useMemo, useRef, useState } from "react";

import { categories, MenuItem } from "@/data/data";

import styles from "./Categorie.module.scss";
import { RainbowButton } from "../ui/rainbow-button";
import InfiniteMovingCards from "../ui/verticalCards";
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

    return [...slicedPart, ...remainingPart];
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
  const [isOpacityZero, setOpacityIsZero] = useState(false);
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
      <div className={`absolute top-0 h-fit w-full z-${zIndex} max-lg:hidden`}>
        <Intermezzo setOpacityIsZero={setOpacityIsZero} />
      </div>
      <div className="max-lg:hidden">
        <motion.main
          className="bg-background z-30 px-8 sticky top-0"
          ref={container}
          style={{ opacity }}
        >
          <div ref={gallery} className={styles.gallery}>
            {Array.from({ length: columns }).map((_, i) => (
              <Column key={i} y={motionValues[i]} i={i} />
            ))}
          </div>
        </motion.main>
      </div>
      <div className="lg:hidden">
        <div className="flex justify-center space-x-8 sticky top-0 h-full">
          <InfiniteMovingCards items={categories} />
          <div className="max-sm:hidden">
            <InfiniteMovingCards items={categories} direction="down" />
          </div>
        </div>
      </div>
    </>
  );
}

interface ColumnProps {
  y: MotionValue<number>;
  i: number;
}

const Column = ({ y, i }: ColumnProps) => {
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

const tags = ["Poesia", "Romantico"];

const Tag = ({ tag }: { tag: string }) => {
  return (
    <div className="bg-green-700 text-foreground text-xs px-2 py-1 rounded-full mr-2 mt-2 mb-4">
      {tag}
    </div>
  );
};

const Card = memo(({ title, description, href, randomStyles }: CardProps) => {
  return (
    <div className="border border-black dark:border-white bg-background min-h-[500px] text-foreground rounded-lg shadow-lg p-6 transition-transform duration-300 flex flex-col justify-between">
      <div className="flex flex-col flex-1">
        <h2 className="text-2xl font-bold mb-2">
          Ho dimenticato il colore dei tuoi occhi
        </h2>
        <div className="h-full w-full flex-1">
          <div className="relative h-full w-full flex-1">
            <Image
              src="/assets/occhi.webp"
              layout="fill"
              objectFit="cover"
              alt="swag"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag, i) => (
            <Tag key={i} tag={tag} />
          ))}
        </div>
      </div>
      <div className="flex mt-4 w-full">
        <RainbowButton className="py-4 w-full">Leggi ora</RainbowButton>
      </div>
    </div>
  );
});

Card.displayName = "Card";
