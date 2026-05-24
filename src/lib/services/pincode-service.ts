/**
 * Pincode service — single source of truth for the user's delivery pincode.
 * Currently backed by localStorage (via use-pincode hook). Plug a server-side
 * session or geo-IP fallback into here without touching consumers.
 */
import { usePincode } from "@/lib/local-storage-hooks";

export function isValidPincode(pin: string): boolean {
  return /^\d{6}$/.test(pin);
}

export { usePincode };

/** Deterministic hash for stable simulated lookups. */
export function pinHash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}