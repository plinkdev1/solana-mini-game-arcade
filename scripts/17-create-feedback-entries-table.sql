-- Create feedback_entries table for Sewer Arena feedback system
-- Anonymous feedback encouraged - no PII stored
CREATE TABLE public.feedback_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_wallet text NULL,  -- Nullable for anonymous feedback (can be shortened/hashed)
  message text NOT NULL,  -- Required feedback message
  rating int CHECK (rating >= 1 AND rating <= 5) NULL,  -- Optional 1-5 star rating
  replied bool DEFAULT false,  -- Track admin responses
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feedback_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone (authenticated or anonymous) can INSERT feedback
CREATE POLICY "Anyone can submit feedback" ON public.feedback_entries
  FOR INSERT
  WITH CHECK (true);

-- Policy: Admins only can SELECT feedback (hardcoded admin wallet check)
CREATE POLICY "Admin only can view feedback" ON public.feedback_entries
  FOR SELECT
  USING (
    -- Replace 'ADMIN_WALLET' with actual admin wallet address
    auth.jwt() ->> 'wallet' = 'ADMIN_WALLET' OR
    auth.jwt() ->> 'sub' IN (
      SELECT id::text FROM public.users
      WHERE wallet_address = 'ADMIN_WALLET'
    )
  );

-- Policy: Admins only can UPDATE feedback (mark replied, etc.)
CREATE POLICY "Admin only can update feedback" ON public.feedback_entries
  FOR UPDATE
  USING (
    auth.jwt() ->> 'wallet' = 'ADMIN_WALLET' OR
    auth.jwt() ->> 'sub' IN (
      SELECT id::text FROM public.users
      WHERE wallet_address = 'ADMIN_WALLET'
    )
  );

-- Enable realtime for admin notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.feedback_entries;

-- Create index on user_wallet for performance
CREATE INDEX idx_feedback_user_wallet ON public.feedback_entries(user_wallet);

-- Create index on created_at for sorting
CREATE INDEX idx_feedback_created_at ON public.feedback_entries(created_at DESC);
