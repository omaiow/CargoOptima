"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.5,
}: {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
}) => {
  const [scope, setScope] = useState(false);
  const wordsArray = words.split(" ");

  useEffect(() => {
    setScope(true);
  }, []);

  return (
    <div className={cn("font-heading", className)}>
      {wordsArray.map((word, idx) => (
        <motion.span
          key={idx}
          initial={{ opacity: 0, filter: filter ? "blur(10px)" : "none" }}
          animate={scope ? { opacity: 1, filter: "blur(0px)" } : {}}
          transition={{ duration, delay: idx * 0.08 }}
          className="inline-block mr-1"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};

