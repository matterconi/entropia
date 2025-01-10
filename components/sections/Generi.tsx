import { useInView } from "framer-motion";
import React, { useRef } from "react";

const Generi = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div className="bg-background h-screen">
      {/* Sticky Header */}
      <div className="text-6xl sticky top-0 z-20 bg-background flex justify-center items-center">
        <h1 className="text-gradient font-title font-5xl p-8 text-center">
          Generi
        </h1>
      </div>

      {/* Content Section to Observe */}
      <div
        ref={ref}
        className={`transition-opacity duration-1000 ${
          isInView ? "opacity-100" : "opacity-0"
        } h-screen flex justify-center items-center`}
      >
        <p className="text-2xl font-body">
          {isInView ? "Content is in view!" : "Scroll to see content"}
        </p>
      </div>
    </div>
  );
};

export default Generi;
