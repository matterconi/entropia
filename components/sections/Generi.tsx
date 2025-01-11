import { useInView } from "framer-motion";
import React, { useRef } from "react";

import InfiniteMovingCards from "@/components/ui/infinite-moving-cards";
import { genres } from "@/data/data";

const Generi = ({ setIsInView }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false });

  // Update parent state whenever visibility changes
  React.useEffect(() => {
    setIsInView(isInView);
  }, [isInView, setIsInView]);

  const quotes = [
    {
      quote: "“The only thing we have to fear is fear itself.”",
      name: "Franklin D. Roosevelt",
      title: "32nd President of the United States",
    },
    {
      quote: "“I have a dream.”",
      name: "Martin Luther King Jr.",
      title: "American civil rights activist",
    },
    {
      quote: "“I think, therefore I am.”",
      name: "René Descartes",
      title: "French philosopher",
    },
  ];

  return (
    <div className="bg-background h-screen relative w-screen">
      {/* Sticky Title */}
      <div
        className="text-6xl z-20 bg-background flex justify-center items-center w-full"
        ref={ref}
      >
        <h1 className="text-gradient font-title font-5xl p-8 text-center mt-12">
          Generi
        </h1>
      </div>
      {/* Centered Cards */}
      <div className="mt-32 absolute inset-0 flex flex-col gap-4 items-center justify-center w-full ">
        <InfiniteMovingCards items={genres} direction="right" speed="slow" />
        <div className="max-md:hidden">
          <InfiniteMovingCards items={genres} direction="left" speed="slow" />
        </div>
      </div>
    </div>
  );
};

export default Generi;
