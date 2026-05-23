import type { Product, PriceEntry } from "@/data/products";
import { platforms, getPlatform } from "@/data/platforms";

export function cheapestPrice(product: Product): PriceEntry | undefined {
  const inStock = product.prices.filter((p) => p.inStock);
  if (!inStock.length) return undefined;
  return inStock.reduce((a, b) => (a.price <= b.price ? a : b));
}

export function highestPrice(product: Product): PriceEntry | undefined {
  return product.prices.reduce((a, b) => (a.price >= b.price ? a : b), product.prices[0]);
}

export function savingsPercent(product: Product): number {
  const low = cheapestPrice(product);
  const high = highestPrice(product);
  if (!low || !high || high.price === 0) return 0;
  return Math.round(((high.price - low.price) / high.price) * 100);
}

export function discountPercent(entry: PriceEntry): number {
  if (!entry.mrp || entry.mrp <= entry.price) return 0;
  return Math.round(((entry.mrp - entry.price) / entry.mrp) * 100);
}

export function unitPriceLabel(entry: PriceEntry): string {
  const { unit, unitQty, price } = entry;
  if (unit === "kg" || unit === "g") {
    const perKg = (price / unitQty) * 1000;
    return `₹${perKg.toFixed(0)}/kg`;
  }
  if (unit === "L" || unit === "ml") {
    const perL = (price / unitQty) * 1000;
    return `₹${perL.toFixed(0)}/L`;
  }
  return `₹${(price / unitQty).toFixed(1)}/pc`;
}

export type BasketItem = { productId: string; qty: number };

export type BasketTotal = {
  platformId: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  available: number;
  unavailable: number;
};

export function basketTotals(items: BasketItem[], productLookup: (id: string) => Product | undefined): BasketTotal[] {
  return platforms.map((pl) => {
    let subtotal = 0;
    let available = 0;
    let unavailable = 0;
    for (const it of items) {
      const p = productLookup(it.productId);
      if (!p) continue;
      const entry = p.prices.find((pe) => pe.platformId === pl.id);
      if (!entry || !entry.inStock) {
        unavailable += it.qty;
        continue;
      }
      subtotal += entry.price * it.qty;
      available += it.qty;
    }
    const platform = getPlatform(pl.id)!;
    const deliveryFee = subtotal >= platform.freeDeliveryAbove || subtotal === 0 ? 0 : platform.deliveryFee;
    return { platformId: pl.id, subtotal, deliveryFee, total: subtotal + deliveryFee, available, unavailable };
  });
}

// ---------- Basket optimization ----------

export type BestSingleBasket = {
  kind: "single";
  platformId: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  available: number;
  unavailable: number;
};

export type SplitAssignment = {
  productId: string;
  qty: number;
  platformId: string;
  unitPrice: number;
};

export type BestSplitBasket = {
  kind: "split";
  /** Per-platform subtotal + delivery summary after splitting items. */
  legs: {
    platformId: string;
    subtotal: number;
    deliveryFee: number;
    items: SplitAssignment[];
  }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  /** items the cheapest platform per-line couldn't fulfil. */
  unfulfilled: { productId: string; qty: number }[];
};

/** Best single-platform basket = the cheapest BasketTotal that can fulfil the most items. */
export function bestSingleBasket(
  items: BasketItem[],
  productLookup: (id: string) => Product | undefined,
): BestSingleBasket | null {
  const totals = basketTotals(items, productLookup).filter((t) => t.available > 0);
  if (!totals.length) return null;
  // Prefer maximum availability first, then cheapest total.
  const sorted = [...totals].sort(
    (a, b) => b.available - a.available || a.total - b.total,
  );
  const winner = sorted[0];
  return { kind: "single", ...winner };
}

/**
 * Best split-platform basket = pick the cheapest in-stock platform per line
 * item, then add each touched platform's delivery fee once. Greedy but
 * deterministic and good enough for MVP — covers the common case where one
 * platform is cheaper for produce and another for staples.
 */
export function bestSplitBasket(
  items: BasketItem[],
  productLookup: (id: string) => Product | undefined,
): BestSplitBasket | null {
  const perPlatform = new Map<string, SplitAssignment[]>();
  const unfulfilled: BestSplitBasket["unfulfilled"] = [];

  for (const it of items) {
    const p = productLookup(it.productId);
    if (!p) {
      unfulfilled.push(it);
      continue;
    }
    const inStock = p.prices.filter((pe) => pe.inStock);
    if (!inStock.length) {
      unfulfilled.push(it);
      continue;
    }
    const cheapest = inStock.reduce((a, b) => (a.price <= b.price ? a : b));
    const bucket = perPlatform.get(cheapest.platformId) ?? [];
    bucket.push({
      productId: it.productId,
      qty: it.qty,
      platformId: cheapest.platformId,
      unitPrice: cheapest.price,
    });
    perPlatform.set(cheapest.platformId, bucket);
  }

  if (perPlatform.size === 0) return null;

  let subtotal = 0;
  let deliveryFee = 0;
  const legs: BestSplitBasket["legs"] = [];
  for (const [platformId, assignments] of perPlatform) {
    const legSubtotal = assignments.reduce((s, a) => s + a.unitPrice * a.qty, 0);
    const pl = getPlatform(platformId)!;
    const legDelivery = legSubtotal >= pl.freeDeliveryAbove ? 0 : pl.deliveryFee;
    subtotal += legSubtotal;
    deliveryFee += legDelivery;
    legs.push({ platformId, subtotal: legSubtotal, deliveryFee: legDelivery, items: assignments });
  }

  legs.sort((a, b) => b.subtotal - a.subtotal);

  return {
    kind: "split",
    legs,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    unfulfilled,
  };
}