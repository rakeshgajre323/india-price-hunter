/**
 * Ranking service — assigns badges per platform row given the full
 * comparison set. Operates on already-validated rows.
 */
import type { CheckoutBreakdown } from "./fee-calculator";
import { totalFees } from "./fee-calculator";

export type RankedRow = {
  breakdown: CheckoutBreakdown;
  available: boolean;
  etaMin: number;
  badges: Badge[];
};

export type Badge =
  | "cheapest-total"
  | "fastest-delivery"
  | "lowest-fees"
  | "recommended"
  | "best-value";

export const BADGE_META: Record<Badge, { label: string; tone: "primary" | "emerald" | "blue" | "amber" }> = {
  "cheapest-total": { label: "Cheapest Total", tone: "primary" },
  "fastest-delivery": { label: "Fastest Delivery", tone: "emerald" },
  "lowest-fees": { label: "Lowest Fees", tone: "blue" },
  recommended: { label: "Recommended", tone: "amber" },
  "best-value": { label: "Best Value", tone: "primary" },
};

export type RankableInput = {
  breakdown: CheckoutBreakdown;
  available: boolean;
  etaMin: number;
};

export function rankPlatforms(rows: RankableInput[]): RankedRow[] {
  const valid = rows.filter((r) => r.available);
  const cheapest = minBy(valid, (r) => r.breakdown.effectiveTotal);
  const fastest = minBy(valid, (r) => r.etaMin);
  const lowestFees = minBy(valid, (r) => totalFees(r.breakdown));
  // Recommended = balanced score: 70% price, 30% ETA (normalized).
  const maxPrice = Math.max(...valid.map((r) => r.breakdown.effectiveTotal), 1);
  const maxEta = Math.max(...valid.map((r) => r.etaMin), 1);
  const recommended = minBy(valid, (r) =>
    0.7 * (r.breakdown.effectiveTotal / maxPrice) + 0.3 * (r.etaMin / maxEta),
  );

  return rows.map((r) => {
    const badges: Badge[] = [];
    if (!r.available) return { ...r, badges };
    if (r === cheapest) badges.push("cheapest-total");
    if (r === fastest) badges.push("fastest-delivery");
    if (r === lowestFees && r !== cheapest) badges.push("lowest-fees");
    if (r === recommended && !badges.includes("cheapest-total")) badges.push("recommended");
    if (badges.includes("cheapest-total") && badges.includes("fastest-delivery")) {
      badges.push("best-value");
    }
    return { ...r, badges };
  });
}

function minBy<T>(arr: T[], f: (x: T) => number): T | undefined {
  if (!arr.length) return undefined;
  return arr.reduce((a, b) => (f(a) <= f(b) ? a : b));
}