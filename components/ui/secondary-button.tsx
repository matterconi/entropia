import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

export interface SecondaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode; // Icon component passed as a prop
  isDarkMode?: boolean; // Prop to determine dark or light mode
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  children,
  className,
  icon,
  isDarkMode = false,
  ...props
}) => {
  return (
    <button
      className={`focus-visible:ring-ring animated-gradient inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-gradient-to-r from-gray-700 to-gray-700 bg-clip-text font-sans text-lg font-medium text-transparent transition-all duration-300 hover:from-cyan-400 hover:via-pink-500 hover:to-yellow-400 focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 dark:from-gray-300 dark:to-gray-300 dark:hover:from-cyan-400 dark:hover:via-pink-500 dark:hover:to-yellow-400 ${className} ${
        isDarkMode ? "dark" : ""
      }`}
      {...props}
    >
      {children}
      {icon === "FaChevronDown" && (
        <div className="relative">
          {/* Gradient Definition */}
          <svg width="0" height="0" className="absolute">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
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
          <FaChevronDown
            className="h-5 w-5"
            style={{
              fill: "url(#gradient)",
              filter: "drop-shadow(0 0 4px rgba(255, 0, 128, 0.5))",
              transition: "transform 0.3s ease",
            }}
          />
        </div>
      )}
    </button>
  );
};
