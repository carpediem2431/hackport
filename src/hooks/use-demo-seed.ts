"use client";

import { useEffect } from "react";
import { ensureDemoSeed, resetUserProgressOnly, restoreDemoSnapshot } from "@/lib/demo-seed";

export function useDemoSeed() {
  useEffect(() => {
    ensureDemoSeed();
  }, []);

  return {
    ready: true,
    restoreDemoSnapshot,
    resetUserProgressOnly,
  };
}
