import { useCallback, useEffect, useRef, useState } from "react";

export default function useHackerTextEffect(targetText: string) {
  const [displayText, setDisplayText] = useState("");
  const isAnimatingRef = useRef(false);
  const intervalRef = useRef<number | null>(null);

  const triggerHackerEffect = useCallback(() => {
    if (isAnimatingRef.current) {
      return;
    }

    isAnimatingRef.current = true;

    const letters = "ABCDEFGHJKLMNOPQRSTUVWXYZ";
    let iteration = 0;

    const interval = setInterval(() => {
      setDisplayText(() => {
        const findRandomIndex = (iteration: number, max: number) => {
          const min = iteration;
          return Math.floor(Math.random() * (max - min + 1)) + min;
        };

        const randomIndex = iteration < 7 ? findRandomIndex(iteration, 7) : 10;

        const newText = targetText
          .split("")
          .map(
            (char, index) =>
              index < iteration
                ? targetText[index] // Keep fixed characters
                : index === randomIndex
                  ? "I" // Insert "I" at the random index
                  : letters[Math.floor(Math.random() * letters.length)], // Random letter otherwise
          )
          .join("");

        return newText;
      });

      iteration++;

      if (iteration > targetText.length) {
        clearInterval(interval);
        setDisplayText(targetText); // Ensure the final state is the original text
        isAnimatingRef.current = false;
      }
    }, 50);
    resetInterval(); // Reset the interval on trigger
  }, [targetText]);

  const startInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current); // Clear any existing interval
    }

    intervalRef.current = window.setInterval(() => {
      triggerHackerEffect();
    }, 10000); // Trigger every 10 seconds
  }, [triggerHackerEffect]);

  const resetInterval = useCallback(() => {
    startInterval(); // Reset the interval when called
  }, [startInterval]);

  useEffect(() => {
    startInterval(); // Start the interval on mount

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current); // Cleanup on unmount
      }
    };
  }, [startInterval]);

  return { displayText, triggerHackerEffect, resetInterval };
}
