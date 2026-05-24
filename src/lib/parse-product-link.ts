import { platforms } from "@/data/platforms";
import { products, type Product } from "@/data/products";

export type ParsedLink = {
  platformId: string | null;
  platformName: string;
  query: string;
  raw: string;
};

// Try to pull a human-readable product name out of a quick-commerce URL.
// Each app encodes the product differently — we handle the common shapes
// and fall back to the last path segment.
export function parseProductLink(input: string): ParsedLink | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  let url: URL;
  try {
    url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");
  const path = url.pathname;
  const segs = path.split("/").filter(Boolean);
  const last = segs[segs.length - 1] ?? "";

  // Match by hostname → platform id
  const platformByHost: Record<string, string> = {
    "zeptonow.com": "zepto",
    "blinkit.com": "blinkit",
    "swiggy.com": "instamart",
    "amazon.in": "amazon-fresh",
    "flipkart.com": "flipkart-minutes",
    "bigbasket.com": "bb-now",
  };
  const platformId =
    Object.entries(platformByHost).find(([h]) => host.endsWith(h))?.[1] ?? null;

  // Extract the query
  let query = "";

  // Common pattern: /pn/<slug>/pvid/<id> (Zepto), /prn/<slug>/prid/<id> (Blinkit),
  // /product/<slug>/<id> (Amazon item-name path), generic last-segment slug.
  const slugLike = segs.find((s) => /[a-z]/.test(s) && s.includes("-") && !/^pv?id$|^pr?id$/i.test(s));
  if (slugLike) {
    query = slugLike.replace(/-/g, " ").replace(/\b\d+(g|ml|kg|l|pc|pcs)\b/gi, "").trim();
  } else if (last) {
    query = decodeURIComponent(last).replace(/[-_]/g, " ").trim();
  }

  // Some apps put it in ?q= / ?query= / ?k=
  const qParam =
    url.searchParams.get("q") ||
    url.searchParams.get("query") ||
    url.searchParams.get("k") ||
    url.searchParams.get("search");
  if (qParam && qParam.length > query.length) query = qParam;

  // Strip leading/trailing junk
  query = query.replace(/\s+/g, " ").replace(/^[^\w]+|[^\w]+$/g, "").trim();
  if (!query) return null;

  return {
    platformId,
    platformName: platformId ? (platforms.find((p) => p.id === platformId)?.name ?? host) : host,
    query,
    raw: trimmed,
  };
}

// Loose match against our local catalog so we can also surface a real
// comparable product card (with prices across apps) when one exists.
export function findCatalogMatches(query: string, limit = 3): Product[] {
  const tokens = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
  if (tokens.length === 0) return [];
  const scored = products.map((p) => {
    const hay = `${p.name} ${p.brand} ${p.slug}`.toLowerCase();
    let score = 0;
    for (const t of tokens) if (hay.includes(t)) score += 1;
    return { p, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.p);
}