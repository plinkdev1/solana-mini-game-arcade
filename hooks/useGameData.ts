"use client"

import { useSupabaseRealtime } from "./useSupabaseRealtime"
import { supabase } from "@/lib/supabase/client"
import type { Game, Leaderboard } from "@/lib/supabase/types"

export function useGameData(gameId?: string) {
  const { data: games, loading: gamesLoading } = useSupabaseRealtime<Game>("games")
  const { data: leaderboards, loading: leaderboardsLoading } = useSupabaseRealtime<Leaderboard>("leaderboards")

  const fetchGameById = async (id: string) => {
    const { data, error } = await supabase.from("games").select("*").eq("id", id).single()

    if (error) throw error
    return data
  }

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase
      .from("leaderboards")
      .select("*")
      .order("rank", { ascending: true })
      .limit(100)

    if (error) throw error
    return data
  }

  return {
    games,
    leaderboards,
    loading: gamesLoading || leaderboardsLoading,
    fetchGameById,
    fetchLeaderboard,
  }
}
