import { motion, useInView, useScroll, useTransform } from "framer-motion";
import React, { JSX, useRef } from "react";

type ParagraphProps = {
  paragraph: string;
};

type WordProps = {
  children: string;
  progress: any; // framer-motion `MotionValue`
  range: [number, number];
};

type CharProps = {
  children: string;
  progress: any; // framer-motion `MotionValue`
  range: [number, number];
};

export default function Character({ paragraph }: ParagraphProps): JSX.Element {
  const container = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(container, { amount: 0.1 }); // Trigger as soon as the element enters the viewport
  const isInFullView = useInView(container, { amount: 1 }); // Trigger when the element is fully in view
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start 0.9", "start 0.35"],
  });

  const { scrollYProgress: opacityProgress } = useScroll({
    target: container,
    offset: ["start 0.15", "end start"],
  });

  const divOpacity = useTransform(opacityProgress, [0, 1], [1, 0]);

  const words = paragraph.split(" ");

  return (
    <motion.p
      ref={container}
      style={{ opacity: divOpacity }}
      className="flex flex-wrap max-w-5xl font-title text-foreground max-sm:text-[2.5rem] max-md:text-5xl md:text-8xl lg:text-9xl leading-none items-center justify-center font-semibold"
    >
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        return (
          <Word key={i} progress={scrollYProgress} range={[start, end]}>
            {word}
          </Word>
        );
      })}
    </motion.p>
  );
}

const Word = ({ children, progress, range }: WordProps): JSX.Element => {
  const amount = range[1] - range[0];
  const step = amount / children.length;

  return (
    <span className="relative mr-3 mt-3">
      {children.split("").map((char, i) => {
        const start = range[0] + i * step;
        const end = range[0] + (i + 1) * step;
        return (
          <Char key={`c_${i}`} progress={progress} range={[start, end]}>
            {char}
          </Char>
        );
      })}
    </span>
  );
};

const Char = ({ children, progress, range }: CharProps): JSX.Element => {
  const opacity = useTransform(progress, range, [0, 1]);

  return (
    <span className="relative">
      <span className="absolute opacity-20">{children}</span>
      <motion.span style={{ opacity }}>{children}</motion.span>
    </span>
  );
};
