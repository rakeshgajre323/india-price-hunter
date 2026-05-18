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