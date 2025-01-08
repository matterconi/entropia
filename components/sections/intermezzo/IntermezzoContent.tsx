"use client";

import { motion } from "framer-motion";
import React from "react";

interface IntermezzoProps {
  isIntersecting: boolean; // Indicates whether the element is intersecting
  paragraph: string; // Paragraph content to display
}

const Intermezzo: React.FC<IntermezzoProps> = ({
  isIntersecting,
  paragraph,
}) => {
  return (
    <motion.div
      initial={{ opacity: 1 }} // Start fully visible
      animate={{ opacity: isIntersecting ? 0 : 1 }} // Animate based on intersection state
      transition={{ duration: 0.3 }} // Smooth fade effect
      className="w-full flex justify-center items-center text-center"
    >
      <p>{paragraph}</p>
    </motion.div>
  );
};

export default Intermezzo;
