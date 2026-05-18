import { useEffect, useState } from "react";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useLocalStorage<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setValue(read(key, fallback));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [key, value, hydrated]);

  return [value, setValue, hydrated] as const;
}

export function usePincode() {
  return useLocalStorage<string>("qc:pincode", "560001");
}

export type AlertRecord = { productId: string; targetPrice: number; createdAt: number };

export function useAlerts() {
  return useLocalStorage<AlertRecord[]>("qc:alerts", []);
}

export type BasketState = { productId: string; qty: number }[];

export function useBasket() {
  return useLocalStorage<BasketState>("qc:basket", []);
}