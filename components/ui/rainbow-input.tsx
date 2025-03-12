import Image from "next/image";
import React from "react";

import { cn } from "@/lib/utils";

interface RainbowInputProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function RainbowInput({
  children,
  className,
  type = "button",
  ...props
}: RainbowInputProps) {
  return (
    <button
      type={type}
      className={cn(
        "relative flex-1 animate-rainbow focus-visible:ring-ring group h-11 cursor-pointer items-center justify-center rounded-md px-8 py-2 transition-colors [background-clip:padding-box,border-box,border-box] [background-origin:border-box] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",

        // Solid background layer under everything
        "before:absolute before:inset-0 before:rounded-md before:bg-white before:dark:bg-black before:z-[-2]",

        // Glow effect layer below the solid background
        "after:animate-rainbow after:absolute after:bottom-[-20%] after:left-1/2 after:z-[-3] after:h-1/5 after:w-3/5 after:-translate-x-1/2 after:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] after:[filter:blur(calc(0.8*1rem))]",

        // Light mode gradient background
        "bg-background",

        // Apply hover styles when focused or hovered
        "focus-within:scale-102 focus-within:shadow-[0_0_12px_hsl(var(--color-1))] ",

        className,
      )}
      {...props}
    >
      <Image
        src="/icons/search.svg"
        width={24}
        height={24}
        alt="Search"
        className="cursor-pointer"
      />
      {children}
    </button>
  );
}
