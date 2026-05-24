/**
 * Availability validator — per (pincode, platform) check returning
 * deliverability + ETA + confidence label.
 *
 * Uses the curated serviceability map in src/data/serviceability.ts.
 * NO randomization. Same input → same output, every time.
 *
 * Later: swap the body to call a live scraper / mobile-API check
 * without changing the signature, so consumers (UI, ranking) stay stable.
 */
import { getPlatform } from "@/data/platforms";
import { lookupCoverage } from "@/data/serviceability";

export type ConfidenceLabel = "Verified" | "Limited Coverage" | "Not Available";

export type AvailabilityStatus = {
  /** True ONLY for verified or limited (with stock) — never guessed. */
  deliverable: boolean;
  inStock: boolean;
  etaMin: number;
  /** UI-facing label. */
  label: ConfidenceLabel;
  /** Short, user-visible explanation. */
  reason?: string;
  /** Platform-level coverage summary (for tooltips / disclaimer). */
  coverageSummary: string;
};

export function validateAvailability(
  pincode: string,
  platformId: string,
  knownInStock = true,
): AvailabilityStatus {
  const pl = getPlatform(platformId);
  if (!pl) {
    return {
      deliverable: false, inStock: false, etaMin: 0,
      label: "Not Available", reason: "Unknown platform", coverageSummary: "—",
    };
  }

  const cov = lookupCoverage(pincode, platformId);

  if (cov.status === "none") {
    return {
      deliverable: false,
      inStock: knownInStock,
      etaMin: 0,
      label: "Not Available",
      reason: `${pl.shortName} doesn't currently deliver to ${pincode}.`,
      coverageSummary: cov.coverageSummary,
    };
  }

  if (!knownInStock) {
    return {
      deliverable: cov.status === "verified",
      inStock: false,
      etaMin: 0,
      label: cov.status === "verified" ? "Verified" : "Limited Coverage",
      reason: "Out of stock at this pincode.",
      coverageSummary: cov.coverageSummary,
    };
  }

  if (cov.status === "limited") {
    return {
      deliverable: true,
      inStock: true,
      // Edge zones see slower handoff — add 5 min to the city average.
      etaMin: pl.avgEtaMin + 5,
      label: "Limited Coverage",
      reason: cov.reason,
      coverageSummary: cov.coverageSummary,
    };
  }

  // verified
  return {
    deliverable: true,
    inStock: true,
    etaMin: pl.avgEtaMin,
    label: "Verified",
    coverageSummary: cov.coverageSummary,
  };
}