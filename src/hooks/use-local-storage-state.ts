"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";
import { loadStorage, saveStorage } from "@/lib/storage";

type SnapshotCache<T> = {
  key: string;
  source: string | null;
  value: T;
};

export function useLocalStorageState<T>(key: string, initialValue: T) {
  const snapshotCacheRef = useRef<SnapshotCache<T>>({
    key,
    source: null,
    value: initialValue,
  });

  const subscribe = useCallback((onStoreChange: () => void) => {
    window.addEventListener("storage", onStoreChange);
    window.addEventListener("storage-sync", onStoreChange);

    return () => {
      window.removeEventListener("storage", onStoreChange);
      window.removeEventListener("storage-sync", onStoreChange);
    };
  }, []);

  const getSnapshot = useCallback(() => {
    const raw = window.localStorage.getItem(key);
    const fallbackSource = raw === null ? `__fallback__:${JSON.stringify(initialValue)}` : raw;
    const cachedSnapshot = snapshotCacheRef.current;

    if (cachedSnapshot.key === key && cachedSnapshot.source === fallbackSource) {
      return cachedSnapshot.value;
    }

    const nextValue = raw === null ? initialValue : loadStorage(key, initialValue);
    snapshotCacheRef.current = {
      key,
      source: fallbackSource,
      value: nextValue,
    };

    return nextValue;
  }, [initialValue, key]);

  const getServerSnapshot = useCallback(() => initialValue, [initialValue]);
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const update = useCallback((next: T | ((prev: T) => T)) => {
    if (typeof next === "function") {
      const raw = window.localStorage.getItem(key);
      const prev = raw === null ? initialValue : loadStorage(key, initialValue);
      saveStorage(key, (next as (prev: T) => T)(prev));
    } else {
      saveStorage(key, next);
    }
  }, [key, initialValue]);

  return { value, setValue: update, ready: true };
}
