import { useEffect, useState } from "react";

export function useSystemTheme() {
  const [isSystemDark, setIsSystemDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      setIsSystemDark(e.matches);
    };

    // Add listener
    mediaQuery.addEventListener("change", handleChange);

    // Cleanup listener
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return isSystemDark;
}
