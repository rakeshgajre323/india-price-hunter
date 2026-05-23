// Image abstraction layer.
// Today every product ships with a curated `placeholder` URL so the UI is
// visually consistent and layout-stable. Later sources (official brand CDN,
// Amazon PA-API, scraper-fed) can overwrite `url` per product without any
// frontend refactor — the rendering layer only reads { source, url }.

export type ProductImageSource =
  | "placeholder" // curated stable fallback (placehold.co / Unsplash)
  | "official" //   brand or manufacturer CDN
  | "amazon" //     Amazon PA-API image
  | "scraper"; //   ingested from a platform scraper

export type ProductImage = {
  source: ProductImageSource;
  url: string;
  // optional, future: alt CDN, srcset, dominant color, etc.
};

/**
 * Build a curated placeholder URL — deterministic, CDN-cached, no random
 * rotation, no layout shift. Uses placehold.co with a neutral surface that
 * matches our design tokens (slate-100 bg, slate-900 ink).
 */
export function placeholderImage(label: string): ProductImage {
  const text = encodeURIComponent(label.slice(0, 28));
  return {
    source: "placeholder",
    url: `https://placehold.co/600x600/f1f5f9/0f172a/png?text=${text}&font=inter`,
  };
}
