-- Create rewards_claims table for tracking claimed/unclaimed rewards
CREATE TABLE IF NOT EXISTS public.rewards_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  month integer NOT NULL,
  year integer NOT NULL,
  claimed boolean DEFAULT false,
  amount numeric NOT NULL,
  nft_minted boolean DEFAULT false,
  nft_type text,
  claimed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Create unique constraint per user/month/year
ALTER TABLE public.rewards_claims ADD CONSTRAINT rewards_claims_user_month_year_unique 
  UNIQUE(user_id, month, year);

-- Enable RLS
ALTER TABLE public.rewards_claims ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own claims
CREATE POLICY "Users can view their own reward claims" 
  ON public.rewards_claims FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own claims
CREATE POLICY "Users can insert reward claims" 
  ON public.rewards_claims FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own claims (for claim action)
CREATE POLICY "Users can claim their own rewards" 
  ON public.rewards_claims FOR UPDATE 
  USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.rewards_claims;
