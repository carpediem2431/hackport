"use client";

import { Badge } from "@/components/ui/badge";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export function LanyardPreview() {
  const x = useMotionValue(0);
  const rotate = useSpring(useTransform(x, [-160, 160], [-18, 18]), {
    stiffness: 120,
    damping: 18,
  });

  return (
    <div
      className="relative mx-auto hidden h-[420px] w-[280px] md:block"
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        x.set(event.clientX - (rect.left + rect.width / 2));
      }}
      onMouseLeave={() => x.set(0)}
    >
      <div className="absolute left-1/2 top-0 h-28 w-[2px] -translate-x-1/2 bg-foreground/20" />
      <motion.div
        style={{ rotate }}
        whileHover={{ y: -8, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        className="absolute left-1/2 top-16 w-[240px] -translate-x-1/2 rounded-[32px] border border-white/80 bg-[#101317] p-5 text-white shadow-2xl transition-shadow duration-300 hover:shadow-[0_34px_70px_rgba(16,19,23,0.45)]"
      >
        <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.24em] text-white/55">Live Pass</p>
            <Badge className="border-white/12 bg-white/10 text-[10px] text-white">D-7</Badge>
          </div>
          <h3 className="mt-3 font-display text-2xl font-semibold">HackPort</h3>
          <p className="mt-2 text-sm text-white/70">Your next move, always visible.</p>
          <div className="mt-10 rounded-[20px] bg-white p-4 text-foreground">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Demo Access</p>
            <p className="mt-2 font-display text-xl font-semibold">Build Sprint Seoul</p>
            <p className="mt-2 text-sm text-muted">Copilot, submission guard, and explainable ranking in one badge.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
