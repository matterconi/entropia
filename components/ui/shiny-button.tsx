"use client";

import { type AnimationProps, motion, MotionProps } from "motion/react";
import React from "react";

import { cn } from "@/lib/utils";

const animationProps = {
  animate: { "--x": "-100%", scale: 1 },
  transition: {
    repeat: Infinity,
    repeatType: "loop",
    repeatDelay: 1,
    type: "spring",
    stiffness: 20,
    damping: 15,
    mass: 2,
    scale: {
      type: "spring",
      stiffness: 200,
      damping: 5,
      mass: 0.5,
    },
  },
} as AnimationProps;

interface ShinyButtonProps
  extends Omit<React.HTMLAttributes<HTMLElement>, keyof MotionProps>,
    MotionProps {
  children: React.ReactNode;
  className?: string;
}

export const ShinyButton = React.forwardRef<
  HTMLButtonElement,
  ShinyButtonProps
>(({ children, className, ...props }, ref) => {
  return (
    <motion.button
      ref={ref}
      className={cn(
        "relative rounded-lg xl:px-6 py-2 font-medium backdrop-blur-xl transition-shadow duration-300 ease-in-out hover:shadow dark:bg-[radial-gradient(circle_at_50%_0%,hsl(var(--background)/10%)_0%,transparent_60%)] dark:hover:shadow-[0_0_20px_hsl(var(--background)/10%)]",
        className,
      )}
      {...animationProps}
      {...props}
    >
      <span
        className="relative flex items-center justify-center size-full tracking-wide text-foreground"
        style={{
          maskImage:
            "linear-gradient(-75deg,hsl(var(--background)) calc(var(--x) + 20%),transparent calc(var(--x) + 30%),hsl(var(--background)) calc(var(--x) + 100%))",
        }}
      >
        {children}
      </span>
      <span
        style={{
          mask: "linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box,linear-gradient(rgb(0,0,0), rgb(0,0,0))",
          maskComposite: "exclude",
        }}
        className="absolute inset-0 z-10 block rounded-[inherit] bg-[linear-gradient(-75deg,hsl(var(--background)/10%)_calc(var(--x)+20%),hsl(var(--background)/50%)_calc(var(--x)+25%),hsl(var(--background)/10%)_calc(var(--x)+100%))] p-px"
      ></span>
    </motion.button>
  );
});

ShinyButton.displayName = "ShinyButton";
