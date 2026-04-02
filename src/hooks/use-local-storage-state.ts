"use client";

import { useEffect, useState } from "react";
import { loadStorage, saveStorage } from "@/lib/storage";

export function useLocalStorageState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => loadStorage(key, initialValue));
  const ready = true;

  useEffect(() => {
    const sync = () => setValue(loadStorage(key, initialValue));
    window.addEventListener("storage", sync);
    window.addEventListener("storage-sync", sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("storage-sync", sync);
    };
  }, [initialValue, key]);

  const update = (next: T) => {
    setValue(next);
    saveStorage(key, next);
  };

  return { value, setValue: update, ready };
}
