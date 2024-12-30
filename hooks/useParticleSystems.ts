import { useEffect, useRef } from "react";

import System from "../lib/classes/System";

interface CanvasRef {
  current: HTMLCanvasElement | null;
}

interface UseParticleSystemsReturn {
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export default function useParticleSystems(
  canvasRef: CanvasRef,
  isDarkMode: boolean,
): UseParticleSystemsReturn {
  const systemsRef = useRef<System[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Function to resize canvas to its container's size
    const resizeCanvas = () => {
      if (!canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth; // Match container width
      canvas.height = canvas.parentElement.clientHeight; // Match container height
    };

    // Set initial size and listen for resize events
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      systemsRef.current.forEach((system) => system.update(ctx));
      systemsRef.current = systemsRef.current.filter(
        (system) => !system.isEmpty(),
      );

      requestAnimationFrame(render);
    };

    render();

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [canvasRef]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    systemsRef.current.push(new System(x, y, isDarkMode));
  };

  return { handleMouseMove };
}
