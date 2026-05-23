import { createFileRoute } from "@tanstack/react-router";
import { buildDeepLink } from "@/data/platforms";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  ANON_COOKIE,
  buildAnonCookie,
  deviceTypeFromUA,
  getClientIp,
  hashIp,
  isBotUserAgent,
  parseCookie,
} from "@/lib/click-tracking.server";

// Wrap an outbound URL with the configured affiliate network (Cuelinks today,
// EarnKaro tomorrow). Modular so we can swap providers without touching the
// redirect route or the frontend.
function wrapAffiliate(url: string): string {
  const cuelinksCid = process.env.CUELINKS_CID;
  if (cuelinksCid) {
    return `https://linksredirect.com/?cid=${encodeURIComponent(cuelinksCid)}&source=qc&url=${encodeURIComponent(url)}`;
  }
  // No affiliate network configured yet — passthrough.
  return url;
}

export const Route = createFileRoute("/api/r/$platform/$productId")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const url = new URL(request.url);
        const slug = url.searchParams.get("q") ?? params.productId;
        const sourcePath = url.searchParams.get("src");
        const correlationId = url.searchParams.get("c");
        const priceRaw = url.searchParams.get("p");
        const mrpRaw = url.searchParams.get("m");
        const price = priceRaw !== null ? Number(priceRaw) : null;
        const mrp = mrpRaw !== null ? Number(mrpRaw) : null;

        const deepLink = buildDeepLink(params.platform, slug, "");
        if (!deepLink || deepLink === "#") {
          return new Response("Unknown platform", { status: 404 });
        }
        const destination = wrapAffiliate(deepLink);

        const ua = request.headers.get("user-agent");
        const cookieHeader = request.headers.get("cookie");
        let anonSid = parseCookie(cookieHeader, ANON_COOKIE);
        let setCookieHeader: string | null = null;
        if (!anonSid) {
          anonSid = crypto.randomUUID();
          setCookieHeader = buildAnonCookie(anonSid);
        }
        const isBot = isBotUserAgent(ua);
        const deviceType = deviceTypeFromUA(ua);
        const ipHash = hashIp(getClientIp(request));

        // Fire-and-forget click log. NEVER block or fail the redirect on logging.
        // Skip writes for obvious bots so analytics stay clean.
        if (!isBot) {
          // Best-effort: kick off without awaiting so latency stays minimal.
          // (Worker runtime may cut off in-flight promises; acceptable for MVP analytics.)
          void supabaseAdmin
            .from("affiliate_clicks")
            .insert({
              platform_id: params.platform,
              product_id: params.productId,
              destination_url: destination,
              source_path: sourcePath,
              referrer: request.headers.get("referer"),
              user_agent: ua,
              anonymous_session_id: anonSid,
              device_type: deviceType,
              ip_hash: ipHash,
              event_type: "affiliate_click",
              correlation_id: correlationId,
            })
            .then(({ error }) => {
              if (error) console.error("[affiliate-click] insert failed", error.message);
            });

          // Capture the price the user saw at click time. Joined to the
          // affiliate_click row via correlation_id for future attribution
          // analysis (price sensitivity, conversion-by-discount, etc.).
          if (price !== null && Number.isFinite(price) && price >= 0) {
            void supabaseAdmin
              .from("price_snapshots")
              .insert({
                product_id: params.productId,
                platform_id: params.platform,
                price,
                mrp: mrp !== null && Number.isFinite(mrp) && mrp >= 0 ? mrp : null,
                source: "click",
                correlation_id: correlationId,
              })
              .then(({ error }) => {
                if (error) console.error("[price-snapshot] insert failed", error.message);
              });
          }
        }

        return new Response(null, {
          status: 302,
          headers: {
            Location: destination,
            "Cache-Control": "no-store",
            ...(setCookieHeader ? { "Set-Cookie": setCookieHeader } : {}),
          },
        });
      },
    },
  },
});
