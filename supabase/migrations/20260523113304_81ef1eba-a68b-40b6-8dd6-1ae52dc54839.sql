ALTER TABLE public.affiliate_clicks
  ADD COLUMN IF NOT EXISTS anonymous_session_id text,
  ADD COLUMN IF NOT EXISTS event_type text NOT NULL DEFAULT 'affiliate_click',
  ADD COLUMN IF NOT EXISTS device_type text,
  ADD COLUMN IF NOT EXISTS ip_hash text,
  ADD COLUMN IF NOT EXISTS correlation_id uuid;

ALTER TABLE public.affiliate_clicks
  ALTER COLUMN destination_url DROP NOT NULL;

DO $$ BEGIN
  ALTER TABLE public.affiliate_clicks
    ADD CONSTRAINT affiliate_clicks_event_type_check
    CHECK (event_type IN ('affiliate_click','outbound_redirect','product_view','basket_compare','alert_created'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_aff_clicks_product_created ON public.affiliate_clicks(product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aff_clicks_platform_created ON public.affiliate_clicks(platform_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aff_clicks_user_created ON public.affiliate_clicks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aff_clicks_anon_created ON public.affiliate_clicks(anonymous_session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aff_clicks_event_type ON public.affiliate_clicks(event_type);
CREATE INDEX IF NOT EXISTS idx_aff_clicks_created ON public.affiliate_clicks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aff_clicks_correlation ON public.affiliate_clicks(correlation_id);