"use client";

import { useScroll, useTransform } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

import Categorie from "@/components/sections/Categorie";
import Contacts from "@/components/sections/Contacts";
import Footer from "@/components/sections/Footer";
import Generi from "@/components/sections/Generi";
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

  const [isGeneriInView, setIsGeneriInView] = useState(false); // State for Generi visibility

  useEffect(() => {
    const checkIntersection = () => {
      const intermezzoElem = intermezzoRef.current;
      const latestArticlesElem = latestArticlesRef.current;

      if (!intermezzoElem || !latestArticlesElem) {
        return; // Safeguard against null
      }

      const intermezzoRect = intermezzoElem.getBoundingClientRect();
      const latestArticlesRect = latestArticlesElem.getBoundingClientRect();

      // Check if the two rectangles intersect
      const intersecting =
        intermezzoRect.bottom > latestArticlesRect.top &&
        intermezzoRect.top <= latestArticlesRect.bottom;

      setIsIntersecting(intersecting);

      if (intersecting && startYRef.current === null) {
        startYRef.current = window.scrollY + intermezzoRect.top;
      }

      if (intersecting && endYRef.current === null) {
        endYRef.current =
          window.scrollY + intermezzoRect.top + intermezzoRect.bottom / 2;
      }
    };

    window.addEventListener("scroll", checkIntersection);
    checkIntersection(); // Initial check

    return () => window.removeEventListener("scroll", checkIntersection);
  }, []);

  // Transform opacity based on scroll position
  const opacity = useTransform(
    scrollY,
    [startYRef.current || 0, endYRef.current || 0],
    startYRef.current !== null && endYRef.current !== null ? [1, 0] : [1, 1],
  );

  return (
    <div className={`min-h-screen bg-background relative`}>
      <Hero />
      <div ref={latestArticlesRef}>
        <LatestArticles />
      </div>
      {/* Placeholder for layout flow */}
      <div className="relative min-h-screen">
        <Categorie isGeneriInView={isGeneriInView} />
      </div>
      {/* Pass setIsGeneriInView to Generi */}
      <Generi setIsInView={setIsGeneriInView} />
      <Contacts />
      <Footer />
    </div>
  );
};

export default Page;
