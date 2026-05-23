CREATE TABLE public.affiliate_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id text NOT NULL,
  product_id text,
  destination_url text NOT NULL,
  source_path text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  referrer text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_affiliate_clicks_platform ON public.affiliate_clicks(platform_id, created_at DESC);
CREATE INDEX idx_affiliate_clicks_product ON public.affiliate_clicks(product_id, created_at DESC);
CREATE INDEX idx_affiliate_clicks_user ON public.affiliate_clicks(user_id, created_at DESC);

ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Anyone can log a click (anonymous + authenticated)
CREATE POLICY "Anyone can insert clicks"
ON public.affiliate_clicks
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Users can read only their own clicks
CREATE POLICY "Users can view own clicks"
ON public.affiliate_clicks
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);