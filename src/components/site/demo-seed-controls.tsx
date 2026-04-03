"use client";

import { DatabaseZap, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemoSeed } from "@/hooks/use-demo-seed";

export function DemoSeedControls() {
  const { ready, resetUserProgressOnly, restoreDemoSnapshot } = useDemoSeed();

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        size="sm"
        variant="secondary"
        disabled={!ready}
        onClick={() => restoreDemoSnapshot()}
      >
        <DatabaseZap className="mr-2 h-4 w-4" />
        데모 데이터 복원
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="border-white/30 text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-40"
        disabled={!ready}
        onClick={() => resetUserProgressOnly()}
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        내 진행 상태 초기화
      </Button>
    </div>
  );
}
