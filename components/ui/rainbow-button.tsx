import React, { useId } from "react";
import { FaChevronDown, FaSignInAlt } from "react-icons/fa";

import { cn } from "@/lib/utils";

interface RainbowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: string;
}

export function RainbowButton({
  children,
  className,
  icon,
  ...props
}: RainbowButtonProps) {
  const uniqueId = useId(); // Generate a unique ID for each button instance

  return (
    <button
      className={cn(
        "w-full animate-rainbow text-primary-foreground focus-visible:ring-ring group relative inline-flex h-11 cursor-pointer items-center justify-center rounded-xl px-8 py-2 font-sans text-lg font-bold transition-colors [background-clip:padding-box,border-box,border-box] [background-origin:border-box]focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-2",

        // Before pseudo-element (glow effect)
        "before:animate-rainbow before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:[filter:blur(calc(0.8*1rem))]",

        // Light mode background colors
        "bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",

        // Dark mode background colors
        "dark:bg-[linear-gradient(#fff,#fff),linear-gradient(#fff_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",

        // Hover effect (reduce brightness and shadow)
        "hover:scale-102 hover:shadow-[0_0_12px_hsl(var(--color-1))] hover:brightness-110",

        className,
      )}
      {...props}
    >
      {children}
      <div className="relative">
        {/* Gradient Definition */}
        <svg width="0" height="0" className="absolute">
          <defs>
            <linearGradient
              id={`gradient-${uniqueId}`} // Use the unique ID
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%">
                <animate
                  attributeName="stop-color"
                  values="#00f5ff; #ff00f7; #ffb400; #00f5ff"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="50%">
                <animate
                  attributeName="stop-color"
                  values="#ff00f7; #ffb400; #00f5ff; #ff00f7"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%">
                <animate
                  attributeName="stop-color"
                  values="#ffb400; #00f5ff; #ff00f7; #ffb400"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </stop>
            </linearGradient>
          </defs>
        </svg>

        {/* Icon with Animated Gradient */}
        {icon === "arrowDown" && (
          <FaChevronDown
            className="h-5 w-5 ml-1 flex-shrink-0"
            style={{
              fill: `url(#gradient-${uniqueId})`, // Use the unique gradient ID
              filter: "drop-shadow(0 0 4px rgba(255, 0, 128, 0.5))",
              transition: "transform 0.5s ease",
            }}
          />
        )}
        {icon === "signIn" && (
          <FaSignInAlt
            className="h-5 w-5 ml-1 flex-shrink-0"
            style={{
              fill: `url(#gradient-${uniqueId})`, // Use the unique gradient ID
              filter: "drop-shadow(0 0 4px rgba(255, 0, 128, 0.5))",
              transition: "transform 0.3s ease",
            }}
          />
        )}
      </div>
    </button>
  );
}
