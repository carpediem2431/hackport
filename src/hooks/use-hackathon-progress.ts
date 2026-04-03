"use client";

import { useCallback, useMemo } from "react";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { storageKeys } from "@/lib/storage";
import { UserProgress } from "@/lib/types";

const emptyProgress: Record<string, UserProgress> = {};

export function useHackathonProgress(slug: string) {
  const { value, setValue, ready } = useLocalStorageState<Record<string, UserProgress>>(storageKeys.progress, emptyProgress);

  const progress = useMemo(() => value[slug], [slug, value]);

  const updateProgress = useCallback((next: UserProgress) => {
    setValue((prev) => ({
      ...prev,
      [slug]: next,
    }));
  }, [slug, setValue]);

  return { progress, updateProgress, ready };
}
