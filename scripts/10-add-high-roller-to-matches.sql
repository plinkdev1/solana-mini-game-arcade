-- Add high_roller column to matches table for token-gating
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS high_roller boolean DEFAULT false;
CREATE INDEX idx_matches_high_roller ON public.matches(high_roller);

-- Create game_activity_logs table for rate limiting (5 games/hour per wallet)
CREATE TABLE IF NOT EXISTS public.game_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet text NOT NULL,
  game_id uuid,
  match_id uuid REFERENCES public.matches(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_activity_wallet_created ON public.game_activity_logs(wallet, created_at);

-- Enable RLS
ALTER TABLE public.game_activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS: Users can only view their own activity
CREATE POLICY "Users can view own activity" 
  ON public.game_activity_logs FOR SELECT 
  USING (wallet = auth.uid()::text OR auth.uid()::text IS NOT NULL);

-- RLS: Log inserts
CREATE POLICY "Authenticated users can log activity" 
  ON public.game_activity_logs FOR INSERT 
  WITH CHECK (auth.uid()::text IS NOT NULL);

ALTER PUBLICATION supabase_realtime ADD TABLE public.game_activity_logs;
