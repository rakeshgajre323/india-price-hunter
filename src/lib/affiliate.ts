// Client-safe helpers for affiliate redirect URLs.
// The real Cuelinks/EarnKaro wrap + click logging happens server-side at
// /api/r/:platform/:productId. The frontend only builds the link.

export function buildRedirectHref(
  platformId: string,
  productId: string,
  opts: {
    slug?: string;
    sourcePath?: string;
    correlationId?: string;
    /** Price shown to the user at click time — captured into price_snapshots. */
    price?: number;
    mrp?: number;
  } = {},
) {
  const params = new URLSearchParams();
  if (opts.slug) params.set("q", opts.slug);
  if (opts.sourcePath) params.set("src", opts.sourcePath);
  if (opts.correlationId) params.set("c", opts.correlationId);
  if (typeof opts.price === "number") params.set("p", String(opts.price));
  if (typeof opts.mrp === "number") params.set("m", String(opts.mrp));
  const qs = params.toString();
  return `/api/r/${encodeURIComponent(platformId)}/${encodeURIComponent(productId)}${qs ? `?${qs}` : ""}`;
}
