-- Enable realtime for tables
alter publication supabase_realtime add table public.games;
alter publication supabase_realtime add table public.bets;
alter publication supabase_realtime add table public.leaderboards;
alter publication supabase_realtime add table public.users;
alter publication supabase_realtime add table public.game_history;
