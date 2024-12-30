"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme();

  // Determine the current theme or system default
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  // Toggle the theme
  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <div
      className="border-gradient rounded-md p-[1px] animated-gradient"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <div className="flex h-[56px] w-[56px] cursor-pointer items-center justify-center rounded-md text-gray-800 shadow-md transition bg-background ">
        {isDark ? (
          <Moon className="h-[1.2rem] w-[1.2rem] text-foreground" />
        ) : (
          <Sun className="h-[1.2rem] w-[1.2rem] text-foreground" />
        )}
      </div>
    </div>
  );
}
