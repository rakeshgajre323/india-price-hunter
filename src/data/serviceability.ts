/**
 * Realistic, curated serviceability map for India's quick-commerce apps.
 *
 * Coverage is keyed by the first 3 digits of the PIN code (the Indian Post
 * "sorting district" prefix). Each platform lists:
 *   - verifiedPrefixes : known operational zones (core city)
 *   - edgePrefixes     : known but partial / outer-zone coverage
 * Anything not in either list is treated as Not Available.
 *
 * This is a curated MVP dataset — NOT a live API. Real-time validation can
 * later plug into the same `validateAvailability()` signature without
 * frontend changes (see availability-validator.ts).
 *
 * Source basis: each platform's published city list as of 2025 (Blinkit
 * ~40 cities, Zepto ~25, Instamart ~50, BB Now ~30, Flipkart Minutes
 * limited to 6 metros, Amazon Fresh ~10 metros).
 */

// ---------- Indian PIN-3 city pools ----------

const HYDERABAD = ["500", "501"];               // Hyd + Secunderabad core
const BANGALORE = ["560", "562"];
const MUMBAI = ["400", "401"];
const DELHI_NCR = ["110", "201", "121", "122", "203"]; // Delhi, Noida, Faridabad, Gurugram, Ghaziabad
const CHENNAI = ["600", "602", "603"];
const KOLKATA = ["700", "711", "712"];
const PUNE = ["411", "412"];
const AHMEDABAD = ["380", "382"];

const TIER1: string[] = [
  ...HYDERABAD, ...BANGALORE, ...MUMBAI, ...DELHI_NCR,
  ...CHENNAI, ...KOLKATA, ...PUNE, ...AHMEDABAD,
];

// Major tier-2 sorting-district prefixes (one prefix per city core).
const TIER2_MAJOR: Record<string, string> = {
  jaipur: "302", lucknow: "226", chandigarh: "160", kochi: "682",
  coimbatore: "641", indore: "452", bhopal: "462", nagpur: "440",
  surat: "395", vadodara: "390", visakhapatnam: "530", mysore: "570",
  mangalore: "575", goa: "403", trivandrum: "695", bhubaneswar: "751",
  guwahati: "781", patna: "800", dehradun: "248", nashik: "422",
  vijayawada: "520", raipur: "492", ranchi: "834", ludhiana: "141",
  amritsar: "143", jalandhar: "144",
};

// ---------- Per-platform coverage ----------

export type PlatformCoverage = {
  /** Tier of service the platform operates at. */
  deliveryTier: "tier-1" | "tier-1-tier-2" | "metro-only" | "limited-rollout";
  /** Known core service prefixes. */
  verifiedPrefixes: string[];
  /** Partial / outer-zone prefixes — Limited Coverage. */
  edgePrefixes?: string[];
  /** Friendly summary used in UI tooltips. */
  coverageSummary: string;
};

const tier2 = (...keys: (keyof typeof TIER2_MAJOR | string)[]) =>
  keys.map((k) => TIER2_MAJOR[k as keyof typeof TIER2_MAJOR] ?? (k as string));

export const COVERAGE: Record<string, PlatformCoverage> = {
  blinkit: {
    deliveryTier: "tier-1-tier-2",
    verifiedPrefixes: [
      ...TIER1,
      ...tier2("jaipur","lucknow","chandigarh","kochi","coimbatore","indore","bhopal","nagpur","surat","vadodara","mysore","goa","ludhiana","dehradun","nashik"),
    ],
    coverageSummary: "~40 Indian cities — all tier-1 metros and most major tier-2.",
  },
  zepto: {
    deliveryTier: "tier-1-tier-2",
    verifiedPrefixes: [
      ...TIER1,
      ...tier2("jaipur","lucknow","kochi","coimbatore","indore","nagpur","surat","vadodara","mysore","chandigarh"),
    ],
    coverageSummary: "~25 Indian cities — tier-1 metros plus ~10 major tier-2.",
  },
  instamart: {
    deliveryTier: "tier-1-tier-2",
    verifiedPrefixes: [
      ...TIER1,
      ...tier2("jaipur","lucknow","chandigarh","kochi","coimbatore","indore","bhopal","nagpur","surat","vadodara","visakhapatnam","mysore","mangalore","goa","trivandrum","nashik","vijayawada","ludhiana","patna"),
    ],
    coverageSummary: "~50 Indian cities — strongest tier-2 reach.",
  },
  "bb-now": {
    deliveryTier: "tier-1-tier-2",
    verifiedPrefixes: [
      ...TIER1,
      ...tier2("jaipur","lucknow","chandigarh","kochi","coimbatore","indore","nagpur","surat","vadodara","visakhapatnam","mysore","mangalore","trivandrum","bhubaneswar","nashik","vijayawada"),
    ],
    coverageSummary: "~30 cities — tier-1 plus most BigBasket-served tier-2.",
  },
  "flipkart-minutes": {
    deliveryTier: "metro-only",
    verifiedPrefixes: [
      ...BANGALORE, ...DELHI_NCR, ...MUMBAI, ...HYDERABAD, ...CHENNAI, ...PUNE,
    ],
    coverageSummary: "Limited rollout — only 6 metros so far.",
  },
  "amazon-fresh": {
    deliveryTier: "metro-only",
    verifiedPrefixes: [
      ...BANGALORE, ...DELHI_NCR, ...MUMBAI, ...HYDERABAD, ...CHENNAI, ...KOLKATA,
      ...PUNE, ...AHMEDABAD,
    ],
    edgePrefixes: tier2("jaipur"),
    coverageSummary: "~10 metros — 2-hour same-day grocery only.",
  },
};

export type CoverageLookup = {
  status: "verified" | "limited" | "none";
  reason?: string;
  coverageSummary: string;
  deliveryTier: PlatformCoverage["deliveryTier"];
};

/**
 * Pure lookup — does this platform serve this PIN, and at what confidence?
 * Does NOT randomize. Result only depends on the curated map above.
 */
export function lookupCoverage(pincode: string, platformId: string): CoverageLookup {
  const cov = COVERAGE[platformId];
  if (!cov) {
    return { status: "none", reason: "Unknown platform", coverageSummary: "—", deliveryTier: "limited-rollout" };
  }
  const prefix = pincode.slice(0, 3);
  if (cov.verifiedPrefixes.includes(prefix)) {
    return { status: "verified", coverageSummary: cov.coverageSummary, deliveryTier: cov.deliveryTier };
  }
  if (cov.edgePrefixes?.includes(prefix)) {
    return {
      status: "limited",
      reason: "Edge of service zone — delivery may be slower or unavailable at peak hours.",
      coverageSummary: cov.coverageSummary,
      deliveryTier: cov.deliveryTier,
    };
  }
  return {
    status: "none",
    reason: `This pincode is outside the platform's known service zones.`,
    coverageSummary: cov.coverageSummary,
    deliveryTier: cov.deliveryTier,
  };
}