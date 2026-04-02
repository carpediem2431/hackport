"use client";

import { useMemo } from "react";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { storageKeys } from "@/lib/storage";
import { UserProgress } from "@/lib/types";

const emptyProgress: Record<string, UserProgress> = {};

export function useHackathonProgress(slug: string) {
  const { value, setValue, ready } = useLocalStorageState<Record<string, UserProgress>>(storageKeys.progress, emptyProgress);

  const progress = useMemo(() => value[slug], [slug, value]);

  const updateProgress = (next: UserProgress) => {
    setValue({
      ...value,
      [slug]: next,
    });
  };

  return { progress, updateProgress, ready };
}
