"use client";

import { useScroll, useTransform } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

import Categorie from "@/components/sections/Categorie";
import Hero from "@/components/sections/Hero";
import Intermezzo from "@/components/sections/intermezzo/Intermezzo";
import LatestArticles from "@/components/sections/LatestArticles";

const Page = () => {
  const intermezzoRef = useRef<HTMLDivElement>(null); // Reference to Intermezzo
  const latestArticlesRef = useRef<HTMLDivElement>(null); // Reference to LatestArticles
  const startYRef = useRef<number | null>(null); // Ref for start of the fade-out
  const endYRef = useRef<number | null>(null); // Ref for end of the fade-out
  const [isIntersecting, setIsIntersecting] = useState(false); // Intersection state
  const { scrollY } = useScroll();

  useEffect(() => {
    const checkIntersection = () => {
      const intermezzoElem = intermezzoRef.current;
      const latestArticlesElem = latestArticlesRef.current;

      if (!intermezzoElem || !latestArticlesElem) {
        console.log("One or both refs are null:", {
          intermezzoElem,
          latestArticlesElem,
        });
        return; // Safeguard against null
      }

      const intermezzoRect = intermezzoElem.getBoundingClientRect();
      const latestArticlesRect = latestArticlesElem.getBoundingClientRect();

      // Check if the two rectangles intersect
      const intersecting =
        intermezzoRect.bottom > latestArticlesRect.top &&
        intermezzoRect.top <= latestArticlesRect.bottom;

      console.log("Intersection Status:", intersecting);
      setIsIntersecting(intersecting);

      if (intersecting && startYRef.current === null) {
        startYRef.current = window.scrollY + intermezzoRect.top;
        console.log("Set startYRef:", startYRef.current);
      }

      if (intersecting && endYRef.current === null) {
        endYRef.current =
          window.scrollY + intermezzoRect.top + intermezzoRect.bottom / 2;
        console.log("Set endYRef:", endYRef.current);
      }
    };

    window.addEventListener("scroll", checkIntersection);
    checkIntersection(); // Initial check

    return () => window.removeEventListener("scroll", checkIntersection);
  }, []);

  // Log for debugging the transform values
  console.log("ScrollY:", scrollY.get());
  console.log("startYRef:", startYRef.current, "endYRef:", endYRef.current);

  // Transform opacity based on scroll position
  const opacity = useTransform(
    scrollY,
    [startYRef.current || 0, endYRef.current || 0],
    startYRef.current !== null && endYRef.current !== null ? [1, 0] : [1, 1],
  );

  console.log("Opacity:", opacity.get());

  return (
    <div className={`min-h-screen bg-[#020529] relative`}>
      <Hero />
      <div ref={intermezzoRef} className="sticky top-0">
        <Intermezzo opacity={opacity} />
      </div>
      <div ref={latestArticlesRef}>
        <LatestArticles />
      </div>

      {/* Placeholder for layout flow */}
      <div className="relative h-screen">
        <Categorie />
      </div>
    </div>
  );
};

export default Page;
