CREATE TABLE public.price_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL,
  platform_id text NOT NULL,
  price numeric(12,2) NOT NULL,
  mrp numeric(12,2),
  currency text NOT NULL DEFAULT 'INR',
  source text NOT NULL DEFAULT 'click',
  correlation_id uuid,
  captured_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_price_snapshots_product_time ON public.price_snapshots (product_id, captured_at DESC);
CREATE INDEX idx_price_snapshots_platform_time ON public.price_snapshots (platform_id, captured_at DESC);
CREATE INDEX idx_price_snapshots_correlation ON public.price_snapshots (correlation_id);

ALTER TABLE public.price_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert price snapshots"
  ON public.price_snapshots
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    source IN ('click','scrape','seed','manual')
    AND price >= 0
    AND (mrp IS NULL OR mrp >= 0)
  );