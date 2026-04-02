"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-shell flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-strong">Something went wrong</p>
      <h1 className="mt-4 font-display text-5xl font-semibold">페이지를 다시 불러와 주세요</h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-muted">
        일시적인 오류가 발생했습니다. 다시 시도해도 해결되지 않으면 데모 데이터를 초기화한 뒤 흐름을 다시 확인해 주세요.
      </p>
      <Button className="mt-8" onClick={() => reset()}>
        다시 시도
      </Button>
    </div>
  );
}
