-- Add chat-ready fields to users table for future SMTP chat integration
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_chat_read timestamp with time zone DEFAULT now();
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS chat_notifications_enabled boolean DEFAULT true;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS chat_notifications_count integer DEFAULT 0;

-- Create indexes for chat queries
CREATE INDEX IF NOT EXISTS idx_users_last_chat_read ON public.users(last_chat_read);
CREATE INDEX IF NOT EXISTS idx_users_chat_notifications ON public.users(chat_notifications_enabled);

-- Add comments for documentation
COMMENT ON COLUMN public.users.last_chat_read IS 'Timestamp when user last read messages (for chat sync)';
COMMENT ON COLUMN public.users.chat_notifications_enabled IS 'Whether user wants chat notifications';
COMMENT ON COLUMN public.users.chat_notifications_count IS 'Unread message count (SMTP chat system integration)';
