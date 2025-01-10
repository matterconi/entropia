import { motion, useInView, useScroll, useTransform } from "framer-motion";
import React, { JSX, useRef } from "react";

type ParagraphProps = {
  paragraph: string;
};

type SentenceProps = {
  sentence: string;
  progress: any; // framer-motion `MotionValue`
  range: [number, number];
};

type WordProps = {
  children: string;
  progress: any; // framer-motion `MotionValue`
  range: [number, number];
};

export default function WordAnimator({
  paragraph,
}: ParagraphProps): JSX.Element {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start end", "end 0.5"],
  });

  // Split the paragraph into sentences
  const sentences = paragraph.split("\n");

  return (
    <motion.div
      ref={container}
      initial={{ opacity: 0 }} // Start fully hidden
      animate={{ opacity: 1 }} // Fade in when in view
      transition={{ duration: 1, delay: 0.5 }} // Add delay to the parent container
      className="flex flex-col max-w-5xl font-sans text-foreground max-sm:text-2xl text-4xl leading-normal space-y-6"
    >
      {sentences.map((sentence, i) => {
        const totalSentences = sentences.length;
        const start = i / totalSentences;
        const end = (i + 1) / totalSentences;

        return (
          <Sentence
            key={i}
            sentence={sentence}
            progress={scrollYProgress}
            range={[start, end]}
          />
        );
      })}
    </motion.div>
  );
}

const Sentence = ({
  sentence,
  progress,
  range,
}: SentenceProps): JSX.Element => {
  const amount = range[1] - range[0];
  const words = sentence.split(" ");
  const step = amount / words.length;

  return (
    <div className="flex flex-wrap">
      {words.map((word, i) => {
        const start = range[0] + i * step;
        const end = range[0] + (i + 1) * step;

        // Map the word's range proportionally within the sentence's range
        return (
          <Word key={`w_${i}`} progress={progress} range={[start, end]}>
            {word}
          </Word>
        );
      })}
    </div>
  );
};

const Word = ({ children, progress, range }: WordProps): JSX.Element => {
  const opacity = useTransform(progress, range, [0, 1]);
  const y = useTransform(progress, range, [20, 0]);

  return (
    <motion.span
      style={{ opacity, y }}
      className="relative mr-2 mt-3 inline-block"
      transition={{
        duration: 0.5, // Control duration of the animation
        delay: 0.3, // Apply the delay
      }}
    >
      {children}
    </motion.span>
  );
};
