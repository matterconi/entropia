import { motion, useScroll, useTransform } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

import Words from "@/components/sections/intermezzo/Words";

const paragraph =
  "Se ti chiedessi, qual è l'ultima volta che hai sognato, cosa risponderesti?\nLa memoria è il più grande mistero della vita. La memoria è pretendere di poter attribuire un senso, di gioire dell'esperienza, di controllare l'evoluzione. Ma l'evoluzione è sconosciuta, procede in segreto lasciandoci ignari in balia del tempo che scorre, dei giorni che passano, delle fluttuazioni degli astri e della teleogia.\nSe ti chiedessi di guardare indietro, pensi che troveresti ciò che ti aspetti? O guarderesti avanti, perché è l'unica direzione a noi concessa? ";

export default function Home({
  position,
  setZIndex,
}: {
  position: number | null;
  setZIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const finalPositionRef = useRef<number>(0); // Persistent value for final position
  const [bottomPosition, setBottomPosition] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(true); // Start as visible by default

  const { scrollY } = useScroll();

  const opacity = useTransform(
    scrollY,
    [finalPositionRef.current - 200, finalPositionRef.current - 50],
    finalPositionRef.current !== 0 ? [1, 0] : [1, 1],
  );

  const handleScroll = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setBottomPosition(rect.bottom);
    }
  };

  useEffect(() => {
    if (ref.current) {
      // Set initial bottom position when the component is mounted
      const rect = ref.current.getBoundingClientRect();
      setBottomPosition(rect.bottom);
    }

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Cleanup scroll event listener
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (bottomPosition !== null && position !== null) {
      const newVisibility = position > bottomPosition;

      // Only update `isVisible` and `setZIndex` if they change
      if (isVisible !== newVisibility) {
        setIsVisible(newVisibility);
        setZIndex(newVisibility ? 0 : 50);
      }

      // Set the finalPosition in the ref once
      if (position > 0 && finalPositionRef.current === 0) {
        finalPositionRef.current = scrollY.get() + bottomPosition - position;
        console.log(finalPositionRef.current);
      }
    }
  }, [position, bottomPosition, isVisible, setZIndex, scrollY]);

  return (
    <main
      className={`w-full h-full flex justify-center items-center max-sm:py-20 py-24 px-16 max-sm:px-12 ${
        isVisible
          ? "bg-background z-20"
          : "pointer-events-none bg-transparent z-0"
      }`}
      ref={ref}
    >
      <motion.main style={{ opacity }}>
        <motion.div className="w-full flex justify-center items-center">
          <Words paragraph={paragraph} />
        </motion.div>
      </motion.main>
    </main>
  );
}
