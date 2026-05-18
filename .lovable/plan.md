# QuickCompare India — MVP Plan

A price-comparison web app for **quick-commerce platforms in India**. v1 ships a polished frontend with realistic seed data and is architected to plug in affiliate feeds / scraper APIs in phase 2.

> Reality check: Zepto, Blinkit, Swiggy Instamart, Amazon Fresh, and Flipkart Minutes do not publish official APIs or affiliate feeds for product-level data. v1 therefore uses curated seed data (~150 SKUs × 5 platforms) so the product is fully usable and demoable today. Real ingestion (Apify actors / Bright Data / partner deals) is a phase-2 decision.

## Platforms in v1
Zepto · Blinkit · Swiggy Instamart · Amazon Fresh · Flipkart Minutes · BB Now (Big Basket) — 6 logos in the compare strip.

## Pages (TanStack Start routes)

```
src/routes/
  __root.tsx              shared shell, header, footer, pincode bar
  index.tsx               /            landing — hero, pincode capture, trending compares, category tiles, "how it works", platform logos
  search.tsx              /search      results grid + facets (category, brand, in-stock-only, sort by price)
  category.$slug.tsx      /category/fruits-vegetables, /staples, /snacks, /dairy, /personal-care, /household
  product.$id.tsx         /product/:id main compare view: price table across platforms, delivery ETA, pack size, in-stock badge, 30-day price chart, set-alert CTA
  compare.tsx             /compare     side-by-side basket comparison (add multiple SKUs, see cheapest total platform)
  deals.tsx               /deals       running offers/discounts feed
  alerts.tsx              /alerts      user's price-drop watchlist (localStorage in v1)
  about.tsx               /about       what we do, data sources, disclaimer
  methodology.tsx         /methodology how prices are sourced & updated
```

Each route ships its own `head()` (title, description, og:title, og:description) for SEO. Hash anchors are not used for navigation.

## Key UX

- **Pincode-first**: header bar prompts for pincode (persisted in localStorage). All prices/availability shown are scoped to that pincode. Default = 560001 (Bangalore).
- **Compare table** on product page: platform logo · price · pack size · unit price (₹/kg, ₹/L) · delivery ETA · in-stock chip · "Open in app" deep-link button.
- **Cheapest-basket** mode: user adds multiple items, app computes per-platform totals incl. delivery fee, highlights winner.
- **Price history sparkline** (30 days, seed data) using Recharts.
- **Price-drop alerts**: stored in localStorage in v1 (no auth). "Sign in to sync" placeholder.
- **Disclaimer** on every price: "Last updated X min ago · prices vary by location".

## Design direction

Clean, trust-forward Indian fintech aesthetic — white surfaces, deep emerald primary (`oklch(0.55 0.15 160)`), saffron accent for deals, generous spacing, Inter for body + Space Grotesk for headings, rounded-xl cards, soft shadows. Platform brand chips use each platform's known colors.

## Data layer (v1)

- `src/data/platforms.ts` — 6 platform metadata records (name, logo URL, brand color, deep-link URL template).
- `src/data/categories.ts` — 6 categories with icons.
- `src/data/products.ts` — ~150 realistic SKUs (Amul milk 1L, Tata Salt 1kg, Maggi 70g×12, etc.) each with `prices: { platformId, price, packSize, mrp, inStock, etaMin, lastUpdatedMin }[]` and a 30-day `priceHistory` per platform (generated deterministically).
- `src/lib/compare.ts` — selectors: cheapest per SKU, cheapest basket, biggest discount, unit-price normaliser.
- All read synchronously; wrapped in `useQuery` with a 60s `staleTime` so phase-2 swap to server functions is a one-file change.

## Architecture for phase-2 ingestion (stubbed, not built)

Folders left empty with README notes so the path is obvious later:
- `src/lib/ingest/` — adapter interface `PlatformAdapter { fetchPrice(sku, pincode) }`.
- `src/routes/api/public/ingest/` — webhook endpoints for Apify actor results.

No scraping, no server functions, no DB in v1.

## Affiliate / monetization slots

- "Open in app" buttons render through `buildDeepLink(platformId, sku, pincode)` — a single function where Cuelinks/EarnKaro affiliate wrapping will later be injected.
- Sponsored deal slot reserved on `/deals` and product page sidebar (placeholder card with "Ad" label).

## Out of scope for v1 (explicit)

- Real-time scraping or any live data fetch
- User auth / accounts / cross-device alert sync
- Email/SMS price-drop notifications
- Food delivery, cabs, general e-commerce verticals
- Mobile app, browser extension
- Admin/CMS for editing SKUs (edit the seed file)
- Payments

## Tech notes

- Stack: TanStack Start + React 19 + Tailwind v4 (tokens in `src/styles.css`) + shadcn/ui + Recharts for charts + Lucide icons.
- All colors via semantic tokens; no hex in components.
- Seed-data approach means zero backend dependencies — works offline in preview.
- Each route file has its own `head()` for SEO; root `__root.tsx` keeps generic defaults only.

## Deliverable after build

A clickable, SSR-rendered marketing-grade comparison site you can demo to investors, partners, or affiliate networks (Cuelinks/EarnKaro) to discuss real data partnerships. Phase-2 plan (live ingestion, auth, alerts backend) will be a separate proposal once data partnerships are confirmed.
