DROP POLICY IF EXISTS "Anyone can insert clicks" ON public.affiliate_clicks;

CREATE POLICY "Insert own or anonymous clicks"
ON public.affiliate_clicks
FOR INSERT
TO anon, authenticated
WITH CHECK (user_id IS NULL OR user_id = auth.uid());