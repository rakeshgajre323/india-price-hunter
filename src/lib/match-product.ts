import { products, type Product, type PriceEntry } from "@/data/products";
import { getPlatform } from "@/data/platforms";
import { normalizeKey, normalizeBrand, parseQuantity, type Quantity } from "@/lib/normalize-product";
import type { ParsedProductLink } from "@/lib/parse-product-link";

/** Cached per-product normalization so we don't redo it on every match call. */
type ProductIndexEntry = {
  product: Product;
  key: string;
  tokens: string[];
  brand: string;
  quantity: Quantity | null;
  packSize: string;
};

let INDEX: ProductIndexEntry[] | null = null;
function getIndex(): ProductIndexEntry[] {
  if (INDEX) return INDEX;
  INDEX = products.map((p) => {
    const titleForKey = `${p.brand} ${p.name} ${p.prices[0]?.packSize ?? ""}`;
    const { key, tokens, quantity } = normalizeKey(titleForKey);
    return {
      product: p,
      key,
      tokens,
      brand: normalizeBrand(p.brand),
      quantity: quantity ?? parseQuantity(p.prices[0]?.packSize ?? ""),
      packSize: p.prices[0]?.packSize ?? "",
    };
  });
  return INDEX;
}

export type MatchTier = "exact" | "same-quantity" | "same-pack" | "same-brand" | "fuzzy";

export type MatchResult = {
  product: Product;
  tier: MatchTier;
  score: number;
};

/**
 * Match a parsed link against our catalog using the documented priority:
 *   1. exact normalized key
 *   2. same quantity (totalBase + unit)
 *   3. same pack size string
 *   4. same brand
 *   5. fuzzy token overlap
 */
export function matchProduct(parsed: ParsedProductLink, limit = 5): MatchResult[] {
  const idx = getIndex();
  const { normalizedKey, tokens, brand, quantity } = parsed.canonicalHints;

  const candidates: MatchResult[] = [];

  for (const entry of idx) {
    let tier: MatchTier | null = null;
    let score = 0;

    if (normalizedKey && entry.key === normalizedKey) {
      tier = "exact";
      score = 1000;
    } else if (
      quantity &&
      entry.quantity &&
      quantity.totalBase === entry.quantity.totalBase &&
      quantity.unit === entry.quantity.unit &&
      tokenOverlap(tokens, entry.tokens) >= 1
    ) {
      tier = "same-quantity";
      score = 500 + tokenOverlap(tokens, entry.tokens) * 10;
    } else if (
      quantity &&
      entry.packSize &&
      entry.packSize.toLowerCase().includes(`${quantity.value}`) &&
      tokenOverlap(tokens, entry.tokens) >= 1
    ) {
      tier = "same-pack";
      score = 300 + tokenOverlap(tokens, entry.tokens) * 10;
    } else if (brand && entry.brand === brand && tokenOverlap(tokens, entry.tokens) >= 1) {
      tier = "same-brand";
      score = 150 + tokenOverlap(tokens, entry.tokens) * 10;
    } else {
      const overlap = tokenOverlap(tokens, entry.tokens);
      if (overlap >= 2) {
        tier = "fuzzy";
        score = overlap * 10;
      }
    }

    if (tier) candidates.push({ product: entry.product, tier, score });
  }

  return candidates.sort((a, b) => b.score - a.score).slice(0, limit);
}

function tokenOverlap(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const set = new Set(b);
  let n = 0;
  for (const t of a) if (set.has(t)) n += 1;
  return n;
}

/* ---------- Effective price calculation ---------- */

export type EffectivePrice = {
  platformId: string;
  /** Item price on the platform (in ₹). */
  price: number;
  mrp: number;
  /** Delivery fee after free-delivery threshold check. */
  deliveryFee: number;
  /** Flat per-order platform fee (convenience). */
  platformFee: number;
  /** Per-order handling/packaging surcharge. */
  handlingFee: number;
  /** Sum of all of the above. THIS is the number we rank on. */
  effectiveTotal: number;
  etaMin: number;
  inStock: boolean;
};

export function effectivePrices(product: Product): EffectivePrice[] {
  return product.prices.map((entry) => fromEntry(entry));
}

function fromEntry(entry: PriceEntry): EffectivePrice {
  const pl = getPlatform(entry.platformId)!;
  const deliveryFee =
    !entry.inStock ? 0 : entry.price >= pl.freeDeliveryAbove ? 0 : pl.deliveryFee;
  const platformFee = entry.inStock ? pl.platformFee : 0;
  const handlingFee = entry.inStock ? pl.handlingFee : 0;
  const effectiveTotal = entry.inStock
    ? entry.price + deliveryFee + platformFee + handlingFee
    : Infinity;
  return {
    platformId: entry.platformId,
    price: entry.price,
    mrp: entry.mrp,
    deliveryFee,
    platformFee,
    handlingFee,
    etaMin: entry.etaMin,
    inStock: entry.inStock,
    effectiveTotal,
  };
}

export function bestValue(rows: EffectivePrice[]): EffectivePrice | undefined {
  const inStock = rows.filter((r) => r.inStock);
  if (!inStock.length) return undefined;
  return inStock.reduce((a, b) => (a.effectiveTotal <= b.effectiveTotal ? a : b));
}

export function fastestDelivery(rows: EffectivePrice[]): EffectivePrice | undefined {
  const inStock = rows.filter((r) => r.inStock);
  if (!inStock.length) return undefined;
  return inStock.reduce((a, b) => (a.etaMin <= b.etaMin ? a : b));
}