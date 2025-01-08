"use client";

import Lenis from "@studio-freight/lenis";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

import { categories } from "@/data/data"; // Import categories from your data file

const Categorie = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const [dimension, setDimension] = useState({ width: 0, height: 0 }); // State to store window dimensions
  const { height } = dimension;
  useEffect(() => {
    const lenis = new Lenis();

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    const resize = () => {
      setDimension({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", resize);
    requestAnimationFrame(raf);
    resize();

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Calculate motion values for each category outside the map
  const motionValues = categories.map((_, index) => {
    return useTransform(
      scrollYProgress,
      [0, 1],
      [(height * (index % 4)) / 2, 0],
    );
  });

  return (
    <>
      <div className="absolute top-0 w-full h-screen bg-red-500 z-10"></div>
      <main className="sticky top-0 w-full h-screen bg-background">
        <div className="h-screen w-full z-10 bg-background" ref={containerRef}>
          <h1 className="text-white text-4xl text-center py-8">Categorie</h1>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                style={{ y: motionValues[index] }} // Apply the precomputed motion value
                className="bg-white text-black p-4 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 h-[70vh]"
              >
                <h2 className="text-2xl font-bold mb-2">{category.title}</h2>
                <p className="text-sm mb-4">{category.description}</p>
                <Link
                  href={category.href}
                  className="text-green-800 font-semibold hover:underline"
                >
                  Scopri di più
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>
    </>
  );
};

export default Categorie;
