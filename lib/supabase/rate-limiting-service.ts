import { supabase } from "@/lib/supabase/client"

const MAX_GAMES_PER_HOUR = 10

export interface RateLimitStatus {
  isLimited: boolean
  gamesThisHour: number
  maxGames: number
  resetTime: Date
}

export async function checkGameRateLimit(walletAddress: string): Promise<RateLimitStatus> {
  try {
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString()
    const now = new Date()

    // Count games played in last hour
    const { data: games, error: gamesError } = await supabase
      .from("game_activity_logs")
      .select("id")
      .eq("wallet", walletAddress)
      .gte("created_at", oneHourAgo)

    if (gamesError) throw gamesError

    const gamesThisHour = games?.length || 0
    const isLimited = gamesThisHour >= MAX_GAMES_PER_HOUR

    // Calculate reset time (next hour boundary)
    const resetTime = new Date(Math.ceil(now.getTime() / 3600000) * 3600000)

    return {
      isLimited,
      gamesThisHour,
      maxGames: MAX_GAMES_PER_HOUR,
      resetTime,
    }
  } catch (error) {
    console.error("[v0] Rate limit check error:", error)
    return {
      isLimited: false,
      gamesThisHour: 0,
      maxGames: MAX_GAMES_PER_HOUR,
      resetTime: new Date(),
    }
  }
}

export async function incrementGameCount(walletAddress: string): Promise<void> {
  try {
    const { data: user } = await supabase
      .from("users")
      .select("games_played_hourly, last_games_hourly_reset")
      .eq("wallet_address", walletAddress)
      .single()

    if (!user) return

    const lastReset = new Date(user.last_games_hourly_reset).getTime()
    const now = Date.now()
    const hourAgo = now - 3600000

    // Reset counter if hour has passed
    let newCount = user.games_played_hourly + 1
    let resetTime = user.last_games_hourly_reset

    if (lastReset < hourAgo) {
      newCount = 1
      resetTime = new Date().toISOString()
    }

    await supabase
      .from("users")
      .update({
        games_played_hourly: newCount,
        last_games_hourly_reset: resetTime,
      })
      .eq("wallet_address", walletAddress)
  } catch (error) {
    console.error("[v0] Game count increment error:", error)
  }
}
