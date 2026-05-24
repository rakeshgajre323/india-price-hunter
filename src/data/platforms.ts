import zeptoLogo from "@/assets/zepto-logo.jpg";
import flipkartLogo from "@/assets/flipkart-logo.png";

export type Platform = {
  id: string;
  name: string;
  shortName: string;
  color: string; // hex used only inside inline styles for brand chips
  deliveryFee: number;
  freeDeliveryAbove: number;
  avgEtaMin: number;
  website: string;
  logo: string; // public URL for brand logo
};

// Logos served through our own /api/logo/<domain> proxy so they benefit from
// year-long edge + browser caching instead of Clearbit's weak headers.
const logoFor = (domain: string) => `/api/logo/${domain}`;

export const platforms: Platform[] = [
  { id: "zepto", name: "Zepto", shortName: "Zepto", color: "#7e3af2", deliveryFee: 25, freeDeliveryAbove: 199, avgEtaMin: 10, website: "https://www.zeptonow.com", logo: zeptoLogo },
  { id: "blinkit", name: "Blinkit", shortName: "Blinkit", color: "#f8cb46", deliveryFee: 20, freeDeliveryAbove: 199, avgEtaMin: 11, website: "https://blinkit.com", logo: logoFor("blinkit.com") },
  { id: "instamart", name: "Swiggy Instamart", shortName: "Instamart", color: "#fc8019", deliveryFee: 29, freeDeliveryAbove: 249, avgEtaMin: 15, website: "https://www.swiggy.com/instamart", logo: logoFor("swiggy.com") },
  { id: "amazon-fresh", name: "Amazon Fresh", shortName: "Amazon Fresh", color: "#ff9900", deliveryFee: 30, freeDeliveryAbove: 299, avgEtaMin: 120, website: "https://www.amazon.in/fresh", logo: "https://images.seeklogo.com/logo-png/38/1/amazon-fresh-logo-png_seeklogo-386992.png" },
  { id: "flipkart-minutes", name: "Flipkart Minutes", shortName: "FK Minutes", color: "#2874f0", deliveryFee: 25, freeDeliveryAbove: 199, avgEtaMin: 12, website: "https://www.flipkart.com/minutes", logo: flipkartLogo },
  { id: "bb-now", name: "BB Now", shortName: "BB Now", color: "#84c225", deliveryFee: 19, freeDeliveryAbove: 199, avgEtaMin: 15, website: "https://www.bigbasket.com/bb-now", logo: "https://play-lh.googleusercontent.com/EuiZnkT8aEKjXDLX74DTp1VRIwWaeRa8Dvo-LOGAxy1FPQ8GzABTIRenksiM-A7Oz48g" },
];

export const getPlatform = (id: string) => platforms.find((p) => p.id === id);

// Real per-platform search URL patterns. Each app has its own search route
// shape — we send the user straight into that app's listing for the query so
// they see the platform's own product photography and live price.
// Phase 2: wrap the final URL with Cuelinks / EarnKaro for affiliate tracking.
export function buildDeepLink(platformId: string, productSlug: string, _pincode: string) {
  const q = encodeURIComponent(productSlug.replace(/-/g, " "));
  switch (platformId) {
    case "zepto":
      return `https://www.zeptonow.com/search?query=${q}`;
    case "blinkit":
      return `https://blinkit.com/s/?q=${q}`;
    case "instamart":
      return `https://www.swiggy.com/instamart/search?custom_back=true&query=${q}`;
    case "amazon-fresh":
      return `https://www.amazon.in/s?k=${q}&i=nowstore`;
    case "flipkart-minutes":
      return `https://www.flipkart.com/search?q=${q}&marketplace=GROCERY`;
    case "bb-now":
      return `https://www.bigbasket.com/ps/?q=${q}&nc=as`;
    default:
      return "#";
  }
}