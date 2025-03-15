"use client";

import React, { forwardRef } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface RainbowInputProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

interface LocalSearchProps {
  route?: string;
  imgSrc?: string;
  placeholder: string;
  otherClasses?: string;
  isSearch?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  required?: boolean;
  disabled?: boolean;
}

function RainbowInput({
  children,
  className,
  disabled,
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
      {children}
    </button>
  );
}

const LocalSearch = forwardRef<HTMLInputElement, LocalSearchProps>(
  (
    {
      placeholder,
      otherClasses = "",
      value,
      onChange,
      name,
      disabled,
      required = false,
      ...props
    },
    ref,
  ) => {
    return (
      <div className="relative w-full max-w-3xl">
        <div className="relative z-10 border-gradient animated-gradient p-[1px] rounded-md">
          <RainbowInput
            className="w-full flex h-[54px] grow flex-1 items-center gap-4 rounded-md px-4 bg-background hover:!bg-background focus:!bg-background"
            type="button"
            disabled={disabled}
          >
            <Input
              ref={ref}
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              name={name}
              required={required}
              disabled={disabled}
              className={`h-fit no-focus w-full rounded-md border-none shadow-none outline-none focus:outline-none focus-visible:outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 ${otherClasses}`}
              {...props}
            />
          </RainbowInput>
        </div>
      </div>
    );
  },
);

// Add display name for React DevTools
LocalSearch.displayName = "LocalSearch";

export default LocalSearch;
