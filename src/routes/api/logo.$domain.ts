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
            // Negative cache: still send a Cache-Control header so we don't
            // hammer Clearbit on a known-bad domain.
            return new Response("Logo unavailable", {
              status: res.status === 404 ? 404 : 502,
              headers: { "Cache-Control": "public, max-age=3600" },
            });
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
          console.error("[logo-proxy] fetch failed", domain, err);
          return new Response("Upstream error", {
            status: 502,
            headers: { "Cache-Control": "public, max-age=60" },
          });
        }
      },
    },
  },
});