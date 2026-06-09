-- Create matches table for game matchmaking
CREATE TABLE IF NOT EXISTS public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type text NOT NULL,
  bet_amount numeric NOT NULL DEFAULT 0.01,
  player1_wallet text NOT NULL,
  player2_wallet text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamp with time zone DEFAULT now(),
  matched_at timestamp with time zone,
  started_at timestamp with time zone,
  game_id uuid REFERENCES public.games(id) ON DELETE SET NULL
);

-- Create index for faster queries
CREATE INDEX idx_matches_status ON public.matches(status);
CREATE INDEX idx_matches_game_type ON public.matches(game_type);
CREATE INDEX idx_matches_bet_amount ON public.matches(bet_amount);

-- Enable RLS
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can view open/matched games
CREATE POLICY "Anyone can view open matches" 
  ON public.matches FOR SELECT 
  USING (status IN ('open', 'matched'));

-- Users can create matches
CREATE POLICY "Authenticated users can create matches" 
  ON public.matches FOR INSERT 
  WITH CHECK (auth.uid()::text = player1_wallet OR auth.uid()::text IS NOT NULL);

-- Players can update their own matches
CREATE POLICY "Players can update their matches" 
  ON public.matches FOR UPDATE 
  USING (player1_wallet = auth.uid()::text OR player2_wallet = auth.uid()::text);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
