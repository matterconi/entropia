"use client";
import React, { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import CollectionCard from "./CollectionCard";

// Tipo per le collezioni
interface Collection {
  _id: string;
  title: string;
  coverImage: string;
  description: string;
  articleCount: number;
  category?: { name: string };
  genre?: { name: string };
  lastUpdated?: string;
  featured?: boolean;
}

const CollectionCards = ({
  direction = "left",
  speed = "normal",
  pauseOnHover = true,
  className,
  collections,
}: {
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
  collections: Collection[];
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
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
            "120s",
          );
        }
      }
    };

    function addAnimation() {
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
    }

    addAnimation();
  }, [direction, speed]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-screen scroller relative z-20 max-md:max-w-[96vw] max-w-[90vw] overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        className,
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex min-w-full shrink-0 gap-4 py-4 w-max flex-nowrap",
          start && "animate-scroll ",
          pauseOnHover && "hover:[animation-play-state:paused]",
        )}
      >
        {collections.map((collection, idx) => {
          return (
            <div key={idx} className="max-w-[350px]">
              <CollectionCard
                collection={collection}
                isFeatured={idx % 5 === 0} // Solo per demo
              />
            </div>
          );
        })}
      </ul>
    </div>
  );
};

export default CollectionCards;
