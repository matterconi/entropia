"use client";
import {
  motion,
  MotionValue,
  useInView,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import React, { useEffect, useRef } from "react";

import Character from "@/components/sections/intermezzo/Character";

const paragraph = "Altri Articoli di Lexopìa";

const width = window.innerWidth;

interface HomeProps {
  setOpacityIsZero: (isZero: boolean) => void;
}

export default function Home({ setOpacityIsZero }: HomeProps) {
  const ref = useRef(null); // Reference to the container
  const container = useRef(null);
  const opacityRef = useRef(1);
  const { scrollYProgress: opacityProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const opacity = useTransform(opacityProgress, [0, 1], [1, 0]);

  useMotionValueEvent(opacityProgress, "change", (latest) => {
    opacityRef.current = latest;
    console.log(latest);
    if (opacityRef.current === 1) {
      setOpacityIsZero(true);
    } else {
      setOpacityIsZero(false);
    }
  });
  return (
    <motion.main className="bg-background w-full flex flex-col justify-center items-center sticky top-0 max-sm:py-20 py-24 px-16 h-screen">
      {/* Divider with geometric shape */}

      <motion.main
        ref={ref}
        className="w-full flex justify-center items-center"
      >
        {/* Motion div with scroll-based opacity */}
        <motion.div
          className="w-full flex justify-center items-center"
          ref={container}
        >
          <Character paragraph={paragraph} />
        </motion.div>
      </motion.main>
    </motion.main>
  );
}
