export type Platform = {
  id: string;
  name: string;
  shortName: string;
  color: string; // hex used only inside inline styles for brand chips
  deliveryFee: number;
  freeDeliveryAbove: number;
  avgEtaMin: number;
  website: string;
};

export const platforms: Platform[] = [
  { id: "zepto", name: "Zepto", shortName: "Zepto", color: "#7e3af2", deliveryFee: 25, freeDeliveryAbove: 199, avgEtaMin: 10, website: "https://www.zeptonow.com" },
  { id: "blinkit", name: "Blinkit", shortName: "Blinkit", color: "#f8cb46", deliveryFee: 20, freeDeliveryAbove: 199, avgEtaMin: 11, website: "https://blinkit.com" },
  { id: "instamart", name: "Swiggy Instamart", shortName: "Instamart", color: "#fc8019", deliveryFee: 29, freeDeliveryAbove: 249, avgEtaMin: 15, website: "https://www.swiggy.com/instamart" },
  { id: "amazon-fresh", name: "Amazon Fresh", shortName: "Amazon Fresh", color: "#ff9900", deliveryFee: 30, freeDeliveryAbove: 299, avgEtaMin: 120, website: "https://www.amazon.in/fresh" },
  { id: "flipkart-minutes", name: "Flipkart Minutes", shortName: "FK Minutes", color: "#2874f0", deliveryFee: 25, freeDeliveryAbove: 199, avgEtaMin: 12, website: "https://www.flipkart.com/minutes" },
  { id: "bb-now", name: "BB Now", shortName: "BB Now", color: "#84c225", deliveryFee: 19, freeDeliveryAbove: 199, avgEtaMin: 15, website: "https://www.bigbasket.com/bb-now" },
];

export const getPlatform = (id: string) => platforms.find((p) => p.id === id);

export function buildDeepLink(platformId: string, productSlug: string, _pincode: string) {
  const p = getPlatform(platformId);
  if (!p) return "#";
  // Phase 2: wrap with Cuelinks/EarnKaro affiliate URL
  return `${p.website}/search?q=${encodeURIComponent(productSlug)}`;
}