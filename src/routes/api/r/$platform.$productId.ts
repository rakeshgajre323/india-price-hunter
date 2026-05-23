import { createFileRoute } from "@tanstack/react-router";
import { buildDeepLink } from "@/data/platforms";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

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

        const deepLink = buildDeepLink(params.platform, slug, "");
        if (!deepLink || deepLink === "#") {
          return new Response("Unknown platform", { status: 404 });
        }
        const destination = wrapAffiliate(deepLink);

        // Fire-and-forget click log. Never block the redirect on logging.
        try {
          await supabaseAdmin.from("affiliate_clicks").insert({
            platform_id: params.platform,
            product_id: params.productId,
            destination_url: destination,
            source_path: sourcePath,
            referrer: request.headers.get("referer"),
            user_agent: request.headers.get("user-agent"),
          });
        } catch (err) {
          console.error("[affiliate-click] insert failed", err);
        }

        return new Response(null, {
          status: 302,
          headers: {
            Location: destination,
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
