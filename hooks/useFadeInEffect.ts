import { useCallback, useEffect, useState } from "react";

export default function useFadeInEffect(onFadeInComplete: () => void) {
  const [opacity, setOpacity] = useState(0);

  const triggerFadeIn = useCallback(() => {
    setOpacity(0); // Reset opacity to 0 at the start
    let fadeStep = 0; // Variable to track progress

    const interval = setInterval(() => {
      fadeStep += 0.2; // Increment fade step
      setOpacity(fadeStep);

      if (fadeStep >= 1) {
        clearInterval(interval); // Stop the interval when opacity reaches 1
        onFadeInComplete(); // Trigger the callback
      }
    }, 50); // Adjust the interval speed for smoother effect
  }, [onFadeInComplete]); // Include the callback in dependencies
  return { opacity, triggerFadeIn };
}
