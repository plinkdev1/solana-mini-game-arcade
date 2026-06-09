-- Add high_roller_min_hold field to users table for token gating
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS high_roller_min_hold numeric DEFAULT 100;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_high_roller_min_hold ON public.users(high_roller_min_hold);
