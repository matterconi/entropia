"use client";
import {
  motion,
  MotionValue,
  useInView,
  useScroll,
  useTransform,
} from "framer-motion";
import React, { useEffect, useRef } from "react";

import Character from "@/components/sections/intermezzo/Character";

const paragraph =
  "Da quando l'uomo esiste, la conoscenza, il dubbio, la sete di sapere sono incessantemente radicate nella sua testa. Possiamo in qualche modo affermare che ne siano l'essenza.";

interface HomeProps {
  opacity: MotionValue<number>;
}

export default function Home({ opacity }: HomeProps) {
  const ref = useRef(null); // Reference to the container
  return (
    <main className="bg-background w-full flex justify-center items-center sticky top-0 max-sm:py-20 py-24 px-16">
      <motion.main
        ref={ref}
        initial={{ opacity: 1 }} // Start fully hidden
        style={{ opacity }} // Fade in when in view
        transition={{ duration: 0.3 }} // Faster fade-in
      >
        {/* Motion div with scroll-based opacity */}
        <motion.div className="w-full flex justify-center items-center">
          <Character paragraph={paragraph} />
        </motion.div>
      </motion.main>
    </main>
  );
}
