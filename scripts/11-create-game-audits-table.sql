-- Create game_audits table for compliance/audit logging
CREATE TABLE IF NOT EXISTS public.game_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES public.matches(id) ON DELETE SET NULL,
  game_id uuid REFERENCES public.games(id) ON DELETE SET NULL,
  wallet1 text NOT NULL,
  wallet2 text NOT NULL,
  bet_amount numeric NOT NULL,
  outcome text NOT NULL, -- 'player1_win', 'player2_win', 'tie', 'cancelled'
  rake_treasury numeric NOT NULL,
  rake_team numeric NOT NULL,
  tx_sigs jsonb, -- Transaction signatures for on-chain verification
  timestamp timestamp with time zone DEFAULT now()
);

-- Create index on match_id for faster queries
CREATE INDEX idx_game_audits_match_id ON public.game_audits(match_id);
CREATE INDEX idx_game_audits_game_id ON public.game_audits(game_id);
CREATE INDEX idx_game_audits_timestamp ON public.game_audits(timestamp DESC);

-- Enable RLS
ALTER TABLE public.game_audits ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admin-only select (read audits)
CREATE POLICY "Admin can view all game audits" 
  ON public.game_audits FOR SELECT 
  USING (
    auth.jwt() ->> 'email' IN (
      SELECT email FROM public.users WHERE id = auth.uid()
    )
    AND auth.jwt() ->> 'role' = 'admin'
  );

-- RLS Policy: Service role can insert audits (for triggers/backend)
CREATE POLICY "Service role can insert game audits" 
  ON public.game_audits FOR INSERT 
  WITH CHECK (true);

-- Trigger function to auto-log completed games
CREATE OR REPLACE FUNCTION log_game_audit()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log when game is completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO public.game_audits (
      game_id,
      match_id,
      wallet1,
      wallet2,
      bet_amount,
      outcome,
      rake_treasury,
      rake_team,
      timestamp
    )
    SELECT
      NEW.id,
      m.id,
      m.player1_wallet,
      m.player2_wallet,
      m.bet_amount,
      CASE 
        WHEN NEW.winner_id = NEW.player1_id THEN 'player1_win'
        WHEN NEW.winner_id = NEW.player2_id THEN 'player2_win'
        ELSE 'tie'
      END,
      COALESCE((SELECT rake_treasury FROM public.bets WHERE game_id = NEW.id LIMIT 1), 0),
      COALESCE((SELECT rake_team FROM public.bets WHERE game_id = NEW.id LIMIT 1), 0),
      now()
    FROM public.matches m
    WHERE m.game_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to games table
CREATE TRIGGER game_completion_audit_trigger
AFTER UPDATE ON public.games
FOR EACH ROW
EXECUTE FUNCTION log_game_audit();

-- Note: Realtime is NOT enabled for this table (no ALTER PUBLICATION for game_audits)
-- This keeps audit logs private and efficient for compliance only
