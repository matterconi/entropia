"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

import { RainbowButton } from "./rainbow-button";

const generateRandomStyles = () => {
  return {
    animationDuration: `${Math.random() * 2 + 3}s`,
    animationDelay: `${Math.random() * 2}s`,
    animationDirection: Math.random() > 0.5 ? "normal" : "reverse",
    backgroundSize: `${Math.random() * 100 + 150}% ${Math.random() * 100 + 150}%`,
  };
};

const Cards = ({
  items,
  direction = "left",
  speed = "slow",
  pauseOnHover = true,
  className,
}: {
  items: {
    description: string;
    title: string;
    href: string;
  }[];
  direction?: "left" | "right";
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
        if (direction === "left") {
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
          containerRef.current.style.setProperty(
            "--animation-duration",
            "1000s",
          );
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

  const randomStyles = useMemo(
    () => items.map(() => generateRandomStyles()),
    [items],
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-screen scroller relative z-20  max-md:max-w-[96vw] max-w-[90vw] overflow-hidden  [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        className,
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          " flex min-w-full shrink-0 gap-4 py-4 w-max flex-nowrap",
          start && "animate-scroll ",
          pauseOnHover && "hover:[animation-play-state:paused]",
        )}
      >
        {items.map((item, idx) => {
          const style = randomStyles[idx];
          return (
            <li
              className="border h-[350px] w-[300px] border-black dark:border-white border-gradient animated-gradient text-foreground rounded-lg shadow-lg p-6 transition-transform duration-300 flex flex-col justify-between"
              style={style}
              key={idx}
            >
              {/* Title */}
              <h2 className="text-2xl font-bold mb-2 flex-shrink-0">
                {item.title}
              </h2>

              {/* Description */}
              <blockquote className="flex-1 pb-8">
                {item.description}
              </blockquote>

              {/* Button */}
              <Link href={item.href}>
                <div className="flex-shrink-0 mt-4">
                  <RainbowButton>Scopri di più</RainbowButton>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Cards;
