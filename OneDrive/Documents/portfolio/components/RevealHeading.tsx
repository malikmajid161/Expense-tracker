"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

export default function RevealHeading({
  text,
  className,
  as: Tag = "h2",
}: {
  text: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}) {
  const words = text.split(" ");
  return (
    <Tag className={cn("h-display", className)}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          initial={{ y: "100%", opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ delay: i * 0.06, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block mr-3 overflow-hidden"
          style={{ display: "inline-block" }}
        >
          {w}
        </motion.span>
      ))}
    </Tag>
  );
}
