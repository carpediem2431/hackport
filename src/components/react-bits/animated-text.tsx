"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export function AnimatedText({
  as: Component = "h1",
  children,
  className,
}: {
  as?: "h1" | "h2" | "p";
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <Component className={className}>{children}</Component>
    </motion.div>
  );
}
