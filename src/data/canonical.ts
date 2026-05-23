// Canonical product layer.
//
// Today: derived in-memory from the seed `products` array, since every seed
// already represents one canonical SKU with N platform listings denormalised
// into `prices[]`.
//
// Tomorrow: replace `buildCanonicalIndex()` with a query against
// `canonical_products` + `platform_listings` Postgres tables. The shape below
// is the contract — scrapers/Amazon PA-API can write rows that conform to
// `PlatformListing` and a matching engine writes the `canonical_product_id`
// FK. The UI never has to change.

import { products, type Product, type PriceEntry } from "./products";
import type { ProductImage } from "@/lib/product-image";

export type CanonicalProduct = {
  id: string;
  normalizedName: string; // matching key (see normalizeTitle)
  displayName: string;
  brand: string;
  categorySlug: string;
  packSize: string;
  unit: PriceEntry["unit"];
  unitQty: number;
  canonicalImage: ProductImage;
};

export type PlatformListing = {
  canonicalProductId: string;
  platformId: string;
  externalId?: string; // platform-side SKU when known
  rawTitle: string;
  url?: string;
  price: number;
  mrp: number;
  inStock: boolean;
  etaMin: number;
  lastUpdatedMin: number;
};

// ----- Normalization engine (rule-based) -----

const NOISE_TOKENS = new Set([
  "the", "and", "with", "pack", "of", "x", "pc", "pcs", "piece", "pieces",
  "ct", "count", "combo", "value", "family", "new", "fresh",
]);

const UNIT_ALIASES: Record<string, string> = {
  litre: "l", liter: "l", ltr: "l", l: "l", ml: "ml",
  kg: "kg", kgs: "kg", g: "g", gm: "g", gms: "g", gram: "g", grams: "g",
};

/** Lowercased, ascii-folded, punctuation-stripped, sorted token bag. */
export function normalizeTitle(input: string): string {
  const folded = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const tokens = folded
    .split(" ")
    .map((t) => UNIT_ALIASES[t] ?? t)
    .filter((t) => t && !NOISE_TOKENS.has(t));

  // Stable sort so order-of-words doesn't matter (e.g. "Apple iPhone" ==
  // "iPhone Apple"). Quantity tokens like "256gb" / "1kg" stay verbatim
  // because they carry SKU-level meaning.
  return tokens.sort().join(" ");
}

/** Pull a normalized brand token out of a free-form title. */
export function extractBrand(brand: string): string {
  return brand.toLowerCase().trim().split(/\s+/)[0] ?? "";
}

// ----- Manual override map -----
// Force a listing onto a specific canonical id, or block a noisy auto-match.
// Key = `${platformId}::${externalId|normalizedTitle}`.
export type ListingOverride =
  | { canonicalProductId: string } // force-map
  | { ignore: true }; // never auto-match this listing

export const listingOverrides: Record<string, ListingOverride> = {
  // Examples (kept empty by default — populate as we see real listings):
  // "blinkit::amul-gold-1l-blr": { canonicalProductId: "amul-gold-1l" },
  // "zepto::weird-bundle-sku": { ignore: true },
};

function overrideKey(platformId: string, key: string) {
  return `${platformId}::${key}`;
}

/**
 * Resolve a raw platform listing to a canonical product id.
 * Order: explicit override → exact normalized match → no match (null).
 * Returning null means "needs human review" — we never silently guess.
 */
export function resolveCanonical(
  platformId: string,
  listing: { externalId?: string; rawTitle: string; brand?: string },
  canonicalIndex: Map<string, CanonicalProduct>,
): string | null {
  const externalKey = listing.externalId
    ? overrideKey(platformId, listing.externalId)
    : null;
  if (externalKey && externalKey in listingOverrides) {
    const ov = listingOverrides[externalKey];
    return "ignore" in ov ? null : ov.canonicalProductId;
  }

  const normTitle = normalizeTitle(
    `${listing.brand ?? ""} ${listing.rawTitle}`,
  );
  const titleKey = overrideKey(platformId, normTitle);
  if (titleKey in listingOverrides) {
    const ov = listingOverrides[titleKey];
    return "ignore" in ov ? null : ov.canonicalProductId;
  }

  for (const c of canonicalIndex.values()) {
    if (c.normalizedName === normTitle) return c.id;
  }
  return null;
}

// ----- Build the canonical view from current seed data -----

function toCanonical(p: Product): CanonicalProduct {
  const first = p.prices[0];
  return {
    id: p.id,
    normalizedName: normalizeTitle(`${p.brand} ${p.name}`),
    displayName: p.name,
    brand: p.brand,
    categorySlug: p.categorySlug,
    packSize: first?.packSize ?? "",
    unit: first?.unit ?? "pc",
    unitQty: first?.unitQty ?? 1,
    canonicalImage: p.imageRef,
  };
}

function toListings(p: Product): PlatformListing[] {
  return p.prices.map((entry) => ({
    canonicalProductId: p.id,
    platformId: entry.platformId,
    rawTitle: p.name,
    price: entry.price,
    mrp: entry.mrp,
    inStock: entry.inStock,
    etaMin: entry.etaMin,
    lastUpdatedMin: entry.lastUpdatedMin,
  }));
}

export const canonicalProducts: CanonicalProduct[] = products.map(toCanonical);
export const platformListings: PlatformListing[] = products.flatMap(toListings);

/** id → CanonicalProduct lookup; also the index the matcher uses. */
export const canonicalIndex: Map<string, CanonicalProduct> = new Map(
  canonicalProducts.map((c) => [c.id, c]),
);

export const listingsByCanonical: Map<string, PlatformListing[]> = (() => {
  const m = new Map<string, PlatformListing[]>();
  for (const l of platformListings) {
    const arr = m.get(l.canonicalProductId) ?? [];
    arr.push(l);
    m.set(l.canonicalProductId, arr);
  }
  return m;
})();