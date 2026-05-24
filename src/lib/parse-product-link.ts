import { platforms } from "@/data/platforms";
import { normalizeKey, normalizeBrand, type Quantity } from "@/lib/normalize-product";

export type SupportedPlatform =
  | "zepto"
  | "blinkit"
  | "instamart"
  | "bb-now"
  | "flipkart-minutes"
  | "amazon-fresh";

export type ParsedProductLink = {
  /** Canonical platform id from src/data/platforms.ts, or null if host wasn't recognized. */
  platform: SupportedPlatform | null;
  platformName: string;
  /** Human-readable slug extracted from the URL, e.g. "amul-gold-milk". */
  productSlug: string;
  /** Platform-native product id when present in the URL (pvid, prid, ASIN, pid, sku). */
  productId?: string;
  /** Best-guess title used downstream for normalization + display. */
  title: string;
  /** Hints we surface to the matcher: brand candidate, parsed quantity, normalized key. */
  canonicalHints: {
    normalizedKey: string;
    tokens: string[];
    brand?: string;
    quantity: Quantity | null;
  };
  raw: string;
};

const HOST_TO_PLATFORM: { test: (h: string) => boolean; id: SupportedPlatform }[] = [
  { test: (h) => /(^|\.)zeptonow\.com$|(^|\.)zepto\.com$/.test(h), id: "zepto" },
  { test: (h) => /(^|\.)blinkit\.com$|(^|\.)grofers\.com$/.test(h), id: "blinkit" },
  { test: (h) => /(^|\.)swiggy\.com$/.test(h), id: "instamart" },
  { test: (h) => /(^|\.)bigbasket\.com$|(^|\.)bbnow\.in$/.test(h), id: "bb-now" },
  { test: (h) => /(^|\.)flipkart\.com$/.test(h), id: "flipkart-minutes" },
  { test: (h) => /(^|\.)amazon\.in$|(^|\.)amazon\.com$/.test(h), id: "amazon-fresh" },
];

/**
 * Sniff `{platform, productSlug, productId, canonicalHints}` out of a pasted
 * quick-commerce product URL. Lightweight (no scraping) — we rely on the URL
 * structure each app uses. Scraper / mobile-API ingestion can later replace
 * just this function and feed the same `canonicalHints` downstream.
 */
export function parseProductLink(input: string): ParsedProductLink | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const platform = HOST_TO_PLATFORM.find((p) => p.test(host))?.id ?? null;
  const segs = url.pathname.split("/").filter(Boolean);

  let productSlug = "";
  let productId: string | undefined;
  let title = "";

  const seg = (name: string) => {
    const i = segs.findIndex((s) => s.toLowerCase() === name);
    return i >= 0 ? segs[i + 1] : undefined;
  };

  switch (platform) {
    case "zepto": {
      // /pn/<slug>/pvid/<uuid>
      productSlug = seg("pn") ?? "";
      productId = seg("pvid");
      break;
    }
    case "blinkit": {
      // /prn/<slug>/prid/<id>  OR  /cn/<cat>/cid/<id>/<slug>
      productSlug = seg("prn") ?? segs[segs.length - 1] ?? "";
      productId = seg("prid");
      break;
    }
    case "instamart": {
      // /instamart/item/<slug>?... OR /instamart/category-listing?... share links
      const itemIdx = segs.findIndex((s) => s === "item");
      if (itemIdx >= 0) productSlug = segs[itemIdx + 1] ?? "";
      productId = url.searchParams.get("itemId") ?? undefined;
      if (!productSlug) productSlug = url.searchParams.get("custom_back") ?? segs[segs.length - 1] ?? "";
      break;
    }
    case "bb-now": {
      // /pd/<id>/<slug>/  OR  /pd/<id>?...
      const pdIdx = segs.findIndex((s) => s === "pd");
      if (pdIdx >= 0) {
        productId = segs[pdIdx + 1];
        productSlug = segs[pdIdx + 2] ?? "";
      } else {
        productSlug = segs[segs.length - 1] ?? "";
      }
      break;
    }
    case "flipkart-minutes": {
      // /<slug>/p/<itemId>?pid=...&lid=...
      const pIdx = segs.findIndex((s) => s === "p");
      productSlug = pIdx > 0 ? segs[pIdx - 1] : segs[segs.length - 1] ?? "";
      productId = url.searchParams.get("pid") ?? (pIdx >= 0 ? segs[pIdx + 1] : undefined);
      break;
    }
    case "amazon-fresh": {
      // /<slug>/dp/<ASIN>/  OR  /dp/<ASIN>
      const dpIdx = segs.findIndex((s) => s === "dp");
      if (dpIdx >= 0) {
        productSlug = dpIdx > 0 ? segs[dpIdx - 1] : "";
        productId = segs[dpIdx + 1];
      } else {
        productSlug = segs[segs.length - 1] ?? "";
      }
      break;
    }
    default: {
      productSlug = segs[segs.length - 1] ?? "";
      productId = url.searchParams.get("id") ?? url.searchParams.get("pid") ?? undefined;
    }
  }

  // Last-resort: query string carries the search term (?q=, ?query=, ?k=).
  if (!productSlug) {
    productSlug =
      url.searchParams.get("q") ||
      url.searchParams.get("query") ||
      url.searchParams.get("k") ||
      "";
  }

  if (!productSlug) return null;

  // Decode percent-escapes, swap dashes/underscores for spaces — that becomes
  // the title we hand to the normalizer.
  title = decodeURIComponent(productSlug).replace(/[-_+]+/g, " ").replace(/\s+/g, " ").trim();

  const { key, tokens, quantity } = normalizeKey(title);

  // Brand candidate = first 1–2 tokens (matcher will fall back gracefully).
  let brand: string | undefined;
  if (tokens.length) {
    const guess = tokens.slice(0, 2).join(" ");
    brand = normalizeBrand(guess);
    if (brand === guess) brand = normalizeBrand(tokens[0]);
  }

  return {
    platform,
    platformName: platform ? (platforms.find((p) => p.id === platform)?.name ?? host) : host,
    productSlug,
    productId,
    title,
    canonicalHints: {
      normalizedKey: key,
      tokens,
      brand,
      quantity,
    },
    raw: trimmed,
  };
}

/** Convenience: does this string look like a URL we should try to parse? */
export function looksLikeUrl(s: string): boolean {
  const t = s.trim();
  if (!t) return false;
  if (/^https?:\/\//i.test(t)) return true;
  return /^[a-z0-9.-]+\.[a-z]{2,}\//i.test(t);
}