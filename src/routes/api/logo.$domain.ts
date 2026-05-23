import { createFileRoute } from "@tanstack/react-router";

// Edge-cached logo proxy.
//
// Why: Clearbit returns ~5 KB per logo but with weak cache headers, so the
// browser re-validates on every page load and the marquee flashes. Proxying
// through our own route lets us set strong cache headers + leverage the
// Cloudflare Worker cache, so the second request anywhere in the world hits
// the edge instead of Clearbit.
//
// Use: src=/api/logo/zeptonow.com

const ONE_YEAR = 60 * 60 * 24 * 365;
const SAFE_DOMAIN = /^[a-z0-9.-]+\.[a-z]{2,}$/i;

function fallbackLogo(domain: string) {
  const label = domain.charAt(0).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="${label} logo"><rect width="128" height="128" rx="28" fill="#f8fafc"/><circle cx="64" cy="64" r="42" fill="#4f46e5"/><text x="64" y="78" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" font-weight="700" fill="#ffffff">${label}</text></svg>`;

  return new Response(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": `public, max-age=${ONE_YEAR}, s-maxage=${ONE_YEAR}, immutable`,
      "CDN-Cache-Control": `public, max-age=${ONE_YEAR}`,
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export const Route = createFileRoute("/api/logo/$domain")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const domain = params.domain.toLowerCase();
        if (!SAFE_DOMAIN.test(domain) || domain.length > 100) {
          return new Response("Bad domain", { status: 400 });
        }

        const upstream = `https://logo.clearbit.com/${encodeURIComponent(domain)}?size=128`;

        try {
          // `cf.cacheEverything` + `cacheTtl` instruct the Cloudflare Worker
          // runtime to store the upstream response in the colo cache, so the
          // next hit anywhere in the world skips Clearbit entirely.
          const res = await fetch(upstream, {
            // @ts-expect-error — Cloudflare-specific RequestInit extension
            cf: { cacheEverything: true, cacheTtl: ONE_YEAR },
          });

          if (!res.ok) {
            return fallbackLogo(domain);
          }

          const body = await res.arrayBuffer();
          return new Response(body, {
            status: 200,
            headers: {
              "Content-Type": res.headers.get("content-type") ?? "image/png",
              // Year-long immutable cache. Logos rarely change; if one does
              // we'll bump the domain segment or add a ?v= query param.
              "Cache-Control": `public, max-age=${ONE_YEAR}, s-maxage=${ONE_YEAR}, immutable`,
              "CDN-Cache-Control": `public, max-age=${ONE_YEAR}`,
              "Access-Control-Allow-Origin": "*",
            },
          });
        } catch (err) {
          return fallbackLogo(domain);
        }
      },
    },
  },
});