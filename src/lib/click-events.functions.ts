import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getRequestHeader } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const EventSchema = z.object({
  correlationId: z.string().uuid(),
  eventType: z.enum([
    "affiliate_click",
    "outbound_redirect",
    "product_view",
    "basket_compare",
    "alert_created",
  ]),
  platformId: z.string().min(1).max(64),
  productId: z.string().min(1).max(128),
  sourcePath: z.string().max(512).optional().nullable(),
});

// Attribute a click to the authenticated user when present.
// Called from the browser in parallel with navigation to the affiliate
// redirect. The redirect route inserts the canonical row (anonymous);
// this fn back-fills user_id on that row via the shared correlation_id.
// Auth is OPTIONAL — anonymous callers still get a no-op success.
export const attributeClick = createServerFn({ method: "POST" })
  .inputValidator((input) => EventSchema.parse(input))
  .handler(async ({ data }) => {
    const authHeader = getRequestHeader("authorization");
    if (!authHeader) return { attributed: false };

    const token = authHeader.replace(/^Bearer\s+/i, "");
    const url = process.env.SUPABASE_URL!;
    const anon = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const sb = createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData } = await sb.auth.getUser();
    const userId = userData?.user?.id ?? null;
    if (!userId) return { attributed: false };

    // Try to back-fill an existing row first.
    const { data: updated, error: upErr } = await supabaseAdmin
      .from("affiliate_clicks")
      .update({ user_id: userId })
      .eq("correlation_id", data.correlationId)
      .is("user_id", null)
      .select("id");
    if (upErr) console.error("[attributeClick] update failed", upErr.message);

    // If the redirect row hasn't landed yet (or this is a non-redirect
    // event like product_view), insert a standalone attribution row.
    if (!updated || updated.length === 0) {
      const { error: insErr } = await supabaseAdmin.from("affiliate_clicks").insert({
        platform_id: data.platformId,
        product_id: data.productId,
        event_type: data.eventType,
        source_path: data.sourcePath ?? null,
        user_id: userId,
        correlation_id: data.correlationId,
      });
      if (insErr) console.error("[attributeClick] insert failed", insErr.message);
    }

    return { attributed: true };
  });