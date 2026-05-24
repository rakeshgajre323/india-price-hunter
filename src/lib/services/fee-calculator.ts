/**
 * Fee calculator — turns an item price + (pincode, platform) into a fully
 * itemized checkout breakdown. Single source of truth for the comparison UI.
 *
 * effective_total =
 *   item_price + gst + delivery_fee + platform_fee +
 *   handling_fee + packaging_fee + surge_fee + small_order_fee
 */
import { getPlatform } from "@/data/platforms";
import { pinHash } from "./pincode-service";

export type CheckoutBreakdown = {
  platformId: string;
  itemPrice: number;
  mrp: number;
  gst: number;
  deliveryFee: number;
  platformFee: number;
  handlingFee: number;
  packagingFee: number;
  surgeFee: number;
  smallOrderFee: number;
  /** Sum of every charge above. THIS is what we rank on. */
  effectiveTotal: number;
  /** Free-delivery threshold from platform config (for UI hints). */
  freeDeliveryAbove: number;
};

export type CheckoutInput = {
  platformId: string;
  itemPrice: number;
  mrp?: number;
  pincode: string;
  /** Multiply item price + per-item taxes by qty. Default 1. */
  qty?: number;
};

const GST_RATE = 0.05; // 5% grocery GST.

export function calculateCheckout({
  platformId,
  itemPrice,
  mrp,
  pincode,
  qty = 1,
}: CheckoutInput): CheckoutBreakdown {
  const pl = getPlatform(platformId);
  if (!pl) throw new Error(`Unknown platform: ${platformId}`);

  const lineItem = itemPrice * qty;
  const gst = Math.round(lineItem * GST_RATE);
  const deliveryFee = lineItem >= pl.freeDeliveryAbove ? 0 : pl.deliveryFee;
  const platformFee = pl.platformFee;
  const handlingFee = pl.handlingFee;
  const packagingFee = pl.packagingFee;
  const surgeFee = surgeFor(pincode, platformId);
  const smallOrderFee = lineItem < pl.minOrderValue ? pl.smallOrderFee : 0;

  const effectiveTotal =
    lineItem +
    gst +
    deliveryFee +
    platformFee +
    handlingFee +
    packagingFee +
    surgeFee +
    smallOrderFee;

  return {
    platformId,
    itemPrice: lineItem,
    mrp: (mrp ?? itemPrice) * qty,
    gst,
    deliveryFee,
    platformFee,
    handlingFee,
    packagingFee,
    surgeFee,
    smallOrderFee,
    effectiveTotal,
    freeDeliveryAbove: pl.freeDeliveryAbove,
  };
}

/** All non-item charges (delivery + platform + handling + packaging + surge + small order). */
export function totalFees(b: CheckoutBreakdown): number {
  return b.deliveryFee + b.platformFee + b.handlingFee + b.packagingFee + b.surgeFee + b.smallOrderFee;
}

/** Deterministic surge by (pincode, platform). 0 / 5 / 10 / 15. */
export function surgeFor(pincode: string, platformId: string): number {
  const h = pinHash(`surge:${pincode}:${platformId}`);
  const tiers = [0, 0, 0, 5, 10, 15];
  return tiers[h % tiers.length];
}