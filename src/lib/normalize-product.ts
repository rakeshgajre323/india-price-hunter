/**
 * Product normalization layer.
 *
 * Everything pasted from a quick-commerce link, plus every catalog entry,
 * gets reduced to a stable `normalized_key` so we can match the same SKU
 * across platforms. Designed to be the single canonical layer that future
 * scraper / mobile-API / realtime-pricing pipelines plug into.
 */

// Brand aliases — left side is what we see in the wild, right side is the
// canonical lowercase brand we store.
const BRAND_ALIASES: Record<string, string> = {
  "amul": "amul",
  "amul-dairy": "amul",
  "tata-sampann": "tata",
  "tata-salt": "tata",
  "tata": "tata",
  "aashirvaad": "aashirvaad",
  "ashirvaad": "aashirvaad",
  "fortune": "fortune",
  "india-gate": "india gate",
  "indiagate": "india gate",
  "mother-dairy": "mother dairy",
  "motherdairy": "mother dairy",
  "nestle": "nestle",
  "nestlé": "nestle",
  "coca-cola": "coca cola",
  "cocacola": "coca cola",
  "coke": "coca cola",
  "lays": "lays",
  "lay-s": "lays",
  "kurkure": "kurkure",
  "maggi": "maggi",
  "parle": "parle",
  "parle-g": "parle",
  "redbull": "red bull",
  "red-bull": "red bull",
  "colgate": "colgate",
  "dove": "dove",
  "dettol": "dettol",
  "lifebuoy": "lifebuoy",
  "gillette": "gillette",
  "vaseline": "vaseline",
  "surf-excel": "surf excel",
  "surfexcel": "surf excel",
  "vim": "vim",
  "harpic": "harpic",
  "lizol": "lizol",
  "origami": "origami",
  "good-knight": "good knight",
  "goodknight": "good knight",
  "fresho": "fresho",
  "eggoz": "eggoz",
  "madhur": "madhur",
  "daily-good": "daily good",
};

export function normalizeBrand(raw: string): string {
  const slug = raw.toLowerCase().trim().replace(/\s+/g, "-");
  return BRAND_ALIASES[slug] ?? raw.toLowerCase().replace(/[-_]+/g, " ").trim();
}

export type Quantity = {
  value: number;
  unit: "g" | "ml" | "pc";
  /** Number of packs in a multipack, e.g. 12 x 70g => packs=12, value=70 */
  packs: number;
  /** Total normalized base quantity (value * packs) in g / ml / pc. */
  totalBase: number;
};

const UNIT_MAP: Record<string, "g" | "ml" | "pc"> = {
  g: "g", gm: "g", gms: "g", gram: "g", grams: "g",
  kg: "g", kgs: "g", kilogram: "g", kilograms: "g",
  ml: "ml", mls: "ml", millilitre: "ml", milliliter: "ml",
  l: "ml", lt: "ml", ltr: "ml", litre: "ml", liter: "ml", liters: "ml", litres: "ml",
  pc: "pc", pcs: "pc", piece: "pc", pieces: "pc", count: "pc", ct: "pc", n: "pc",
};

/**
 * Extract `{value, unit, packs}` from arbitrary strings like:
 *   "1 L", "500 g", "12 x 70 g", "6 pc", "2kg", "750ml", "Pack of 4"
 */
export function parseQuantity(input: string): Quantity | null {
  const s = input.toLowerCase().replace(/×/g, "x");

  // "Pack of N" — counts only, no per-unit weight
  const packOf = s.match(/pack\s*of\s*(\d+)/);
  let packs = 1;
  if (packOf) packs = Number(packOf[1]);

  // "12 x 70g" / "4 x 125 g"
  const multi = s.match(/(\d+)\s*x\s*(\d+(?:\.\d+)?)\s*([a-z]+)/);
  if (multi) {
    const p = Number(multi[1]);
    const v = Number(multi[2]);
    const u = UNIT_MAP[multi[3]];
    if (u) {
      const scaled = /kg|kilogram/.test(multi[3]) ? v * 1000 : /^l$|lt|ltr|litre|liter/.test(multi[3]) ? v * 1000 : v;
      return { value: scaled, unit: u, packs: p, totalBase: scaled * p };
    }
  }

  // single quantity "500 g", "1 L", "750ml", "2kg"
  const single = s.match(/(\d+(?:\.\d+)?)\s*(kg|kgs|g|gm|gms|gram|grams|ml|mls|l|lt|ltr|litre|liter|liters|litres|pc|pcs|piece|pieces|count|ct|n)\b/);
  if (single) {
    const v = Number(single[1]);
    const u = UNIT_MAP[single[2]];
    if (u) {
      const scaled = /kg|kilogram/.test(single[2]) ? v * 1000 : /^l$|lt|ltr|litre|liter/.test(single[2]) ? v * 1000 : v;
      return { value: scaled, unit: u, packs, totalBase: scaled * packs };
    }
  }

  // bare count "6 eggs" / "Eggs 6"
  const count = s.match(/\b(\d+)\s*(eggs?|bottles?|cans?|sachets?|tetra(?:\s*pak)?)\b/);
  if (count) {
    const v = Number(count[1]);
    return { value: v, unit: "pc", packs: 1, totalBase: v };
  }

  return null;
}

export function formatQuantity(q: Quantity): string {
  const base = q.value;
  const unitLabel =
    q.unit === "g" ? (base >= 1000 ? `${base / 1000} kg` : `${base} g`) :
    q.unit === "ml" ? (base >= 1000 ? `${base / 1000} L` : `${base} ml`) :
    `${base} pc`;
  return q.packs > 1 ? `${q.packs} x ${unitLabel}` : unitLabel;
}

/**
 * Reduce arbitrary text to a stable key:
 *   "Amul Gold Milk 1 L Pouch" → "amul gold milk|1000ml"
 * Brand normalized, quantity standardized to base units, descriptors stripped.
 */
const STOP_WORDS = new Set([
  "the", "a", "an", "of", "pack", "buy", "online", "new", "fresh", "premium",
  "best", "with", "free", "combo", "value", "saver", "family", "pouch",
  "bottle", "tetra", "carton", "box", "bag", "refill", "pet", "tin", "jar",
  "container", "packet", "ct",
]);

export function normalizeKey(rawTitle: string): { key: string; tokens: string[]; quantity: Quantity | null } {
  const quantity = parseQuantity(rawTitle);

  // 1. lowercase, strip diacritics, replace punctuation with spaces
  let t = rawTitle
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ");

  // 2. drop the quantity blob so it doesn't pollute tokens
  t = t.replace(/(\d+(?:\.\d+)?)\s*(kg|kgs|g|gm|gms|gram|grams|ml|mls|l|lt|ltr|litre|liter|liters|litres|pc|pcs|piece|pieces|count|ct|n)\b/g, " ");
  t = t.replace(/(\d+)\s*x\s*(\d+(?:\.\d+)?)/g, " ");
  t = t.replace(/pack\s*of\s*\d+/g, " ");

  // 3. tokenize, drop stop words and bare numbers
  let tokens = t.split(/\s+/).filter((tok) => tok && !STOP_WORDS.has(tok) && !/^\d+$/.test(tok));

  // 4. brand normalization — if first 1–2 tokens form a known brand, swap them
  const candidates = [tokens.slice(0, 2).join("-"), tokens[0]];
  for (const c of candidates) {
    if (c && BRAND_ALIASES[c]) {
      const brandTokens = BRAND_ALIASES[c].split(" ");
      tokens = [...brandTokens, ...tokens.slice(c.split("-").length)];
      break;
    }
  }

  // 5. dedupe consecutive duplicate tokens
  tokens = tokens.filter((tok, i) => tok !== tokens[i - 1]);

  const qtyKey = quantity ? `${quantity.totalBase}${quantity.unit}` : "";
  const key = [tokens.join(" "), qtyKey].filter(Boolean).join("|");

  return { key, tokens, quantity };
}