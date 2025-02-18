"use client";

import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

import { RainbowButton } from "./rainbow-button";

const Cards = ({
  items,
  direction = "up",
  speed = "normal",
  pauseOnHover = true,
  className,
}: {
  items: {
    description: string;
    title: string;
    href: string;
  }[];
  direction?: "up" | "down";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);

  const [start, setStart] = useState(false);

  const addAnimation = React.useCallback(() => {
    const getDirection = () => {
      if (containerRef.current) {
        if (direction === "up") {
          containerRef.current.style.setProperty(
            "--animation-direction",
            "forwards",
          );
        } else {
          containerRef.current.style.setProperty(
            "--animation-direction",
            "reverse",
          );
        }
      }
    };
    const getSpeed = () => {
      if (containerRef.current) {
        if (speed === "fast") {
          containerRef.current.style.setProperty("--animation-duration", "20s");
        } else if (speed === "normal") {
          containerRef.current.style.setProperty("--animation-duration", "40s");
        } else {
          containerRef.current.style.setProperty("--animation-duration", "80s");
        }
      }
    };
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      getDirection();
      getSpeed();
      setStart(true);
    }
  }, [direction, speed]);

  useEffect(() => {
    addAnimation();
  }, [addAnimation]);

  const tags = ["Poesia", "Romantico"];

  const Tag = ({ tag }: { tag: string }) => {
    return (
      <div className="bg-green-700 text-foreground text-xs px-2 py-1 rounded-full mr-2 mt-2 mb-4">
        {tag}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        " relative z-20  w-fit overflow-hidden h-[200vh]",
        className,
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          " flex flex-col min-w-full shrink-0 gap-4 py-4 w-max flex-nowrap items-center justify-center",
          start && "animate-scrollY ",
          pauseOnHover && "hover:[animation-play-state:paused]",
        )}
      >
        {items.map((item, idx) => {
          return (
            <li
              className="border border-black dark:border-white bg-background min-h-[500px] w-[300px] text-foreground rounded-lg shadow-lg p-6 transition-transform duration-300 flex flex-col justify-between"
              key={idx}
            >
              <div className="flex flex-col flex-1">
                <h2 className="text-2xl font-bold mb-2">
                  Ho dimenticato il colore dei tuoi occhi
                </h2>
                <div className="h-full w-full flex-1 relative">
                  <Image
                    src="/assets/occhi.webp"
                    fill
                    style={{ objectFit: "cover" }}
                    alt="swag"
                  />
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
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Cards;
