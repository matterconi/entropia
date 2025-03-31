// hooks/useParallax.ts
import { useEffect, useRef, useState } from "react";

interface ParallaxOptions {
  intensity?: number;
  direction?: "up" | "down";
  maxOffset?: number;
}

/**
 * Un hook per creare un effetto parallax semplificato
 */
export function useParallax({
  intensity = 1,
  direction = "down",
  maxOffset = 50,
}: ParallaxOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState("0%");

  useEffect(() => {
    // Funzione che calcola e imposta l'offset in base alla posizione dello scroll
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // La posizione dell'elemento rispetto alla finestra di visualizzazione
      const elementTop = rect.top;
      const elementBottom = rect.bottom;
      const elementHeight = rect.height;

      // Calcola quando l'elemento è completamente visibile
      const isElementFullyVisible =
        elementTop >= 0 && elementBottom <= windowHeight;
      const isElementPartiallyVisible =
        elementTop < windowHeight && elementBottom > 0;

      if (!isElementPartiallyVisible) return;

      // Calcola la percentuale di visibilità dell'elemento
      let visiblePercent;

      if (isElementFullyVisible) {
        visiblePercent = 1; // Completamente visibile
      } else if (elementTop < 0) {
        // Elemento ha superato la parte superiore della finestra
        visiblePercent = Math.min(1, elementBottom / elementHeight);
      } else {
        // Elemento è visibile dalla parte inferiore
        visiblePercent = Math.min(
          1,
          (windowHeight - elementTop) / elementHeight,
        );
      }

      // Applica un easing per un movimento più fluido
      const easedValue = easeInOutCubic(visiblePercent);

      // Calcola l'offset in base alla direzione
      const finalOffset =
        direction === "down"
          ? easedValue * maxOffset * intensity
          : (1 - easedValue) * maxOffset * intensity;

      setOffset(`${finalOffset}%`);
    };

    // Easing function per un movimento più naturale
    function easeInOutCubic(t: number): number {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // Imposta l'offset iniziale
    handleScroll();

    // Aggiungi l'event listener per lo scroll
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Pulizia
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [direction, intensity, maxOffset]);

  return [containerRef, offset] as const;
}
