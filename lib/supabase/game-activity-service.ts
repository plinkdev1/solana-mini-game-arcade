import { supabase } from "./client"

// Check games played in last hour
export async function getGamesPlayedThisHour(wallet: string): Promise<number> {
  try {
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString()

    const { data, error } = await supabase
      .from("game_activity_logs")
      .select("id")
      .eq("wallet", wallet)
      .gte("created_at", oneHourAgo)

    if (error) throw error
    return data?.length || 0
  } catch (err) {
    console.error("[v0] getGamesPlayedThisHour error:", err)
    return 0
  }
}

// Log game activity
export async function logGameActivity(wallet: string, matchId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("game_activity_logs").insert({
      wallet,
      match_id: matchId,
    })

    if (error) throw error
    return true
  } catch (err) {
    console.error("[v0] logGameActivity error:", err)
    return false
  }
}

// Check if player has reached rate limit
export async function isRateLimited(wallet: string): Promise<boolean> {
  const gamesPlayed = await getGamesPlayedThisHour(wallet)
  return gamesPlayed >= 5
}
