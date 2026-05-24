/**
 * Availability validator — per (pincode, platform) check returning
 * deliverability + ETA + reason. Today this is deterministic simulation;
 * later, swap in a live scraper / mobile-API ingestion behind the same
 * function signature without touching consumers.
 */
import { getPlatform } from "@/data/platforms";
import { pinHash } from "./pincode-service";

export type AvailabilityStatus = {
  deliverable: boolean;
  inStock: boolean;
  etaMin: number;
  reason?: string;
};

export function validateAvailability(
  pincode: string,
  platformId: string,
  knownInStock = true,
): AvailabilityStatus {
  const pl = getPlatform(platformId);
  if (!pl) {
    return { deliverable: false, inStock: false, etaMin: 0, reason: "Unknown platform" };
  }
  const deliverable = pinHash(`${pincode}:${platformId}`) % 100 < 85;
  if (!deliverable) {
    return { deliverable: false, inStock: knownInStock, etaMin: 0, reason: "Not deliverable to your location" };
  }
  if (!knownInStock) {
    return { deliverable: true, inStock: false, etaMin: 0, reason: "Out of stock" };
  }
  // ETA jitters ±2 min per (pincode, platform).
  const jitter = (pinHash(`eta:${pincode}:${platformId}`) % 5) - 2;
  return { deliverable: true, inStock: true, etaMin: Math.max(5, pl.avgEtaMin + jitter) };
}