import { supabase } from "./client"

export interface MatchData {
  gameType: string
  betAmount: number
  playerWallet: string
}

// Create a new open match
export async function createMatch(data: MatchData) {
  try {
    const { data: match, error } = await supabase
      .from("matches")
      .insert({
        game_type: data.gameType,
        bet_amount: data.betAmount,
        player1_wallet: data.playerWallet,
        status: "open",
      })
      .select()
      .single()

    if (error) throw error
    return match
  } catch (err) {
    console.error("[v0] createMatch error:", err)
    return null
  }
}

// Join an existing match
export async function joinMatch(matchId: string, playerWallet: string) {
  try {
    const { data: match, error } = await supabase
      .from("matches")
      .update({
        player2_wallet: playerWallet,
        status: "matched",
        matched_at: new Date().toISOString(),
      })
      .eq("id", matchId)
      .select()
      .single()

    if (error) throw error
    return match
  } catch (err) {
    console.error("[v0] joinMatch error:", err)
    return null
  }
}

// Get open matches with filters
export async function getOpenMatches(gameType?: string, betAmount?: number) {
  try {
    let query = supabase.from("matches").select("*").eq("status", "open")

    if (gameType) {
      query = query.eq("game_type", gameType)
    }

    if (betAmount) {
      query = query.eq("bet_amount", betAmount)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (err) {
    console.error("[v0] getOpenMatches error:", err)
    return []
  }
}

// Random queue matching - find similar bet amount
export async function findRandomMatch(gameType: string, betAmount: number, playerWallet: string) {
  try {
    // Find any open match with same game type and bet (within 0.01 range)
    const minBet = Math.max(0.01, betAmount - 0.01)
    const maxBet = betAmount + 0.01

    const { data: matches, error } = await supabase
      .from("matches")
      .select("*")
      .eq("game_type", gameType)
      .eq("status", "open")
      .gte("bet_amount", minBet)
      .lte("bet_amount", maxBet)
      .neq("player1_wallet", playerWallet)
      .limit(1)

    if (error) throw error

    if (matches && matches.length > 0) {
      return matches[0]
    }

    return null
  } catch (err) {
    console.error("[v0] findRandomMatch error:", err)
    return null
  }
}

// Subscribe to matches realtime updates
export function subscribeToMatches(callback: (event: any) => void) {
  const channel = supabase
    .channel("matches_realtime")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "matches",
        filter: "status=eq.open",
      },
      (payload) => {
        callback(payload)
      },
    )
    .subscribe()

  return channel
}

// Cancel a match
export async function cancelMatch(matchId: string) {
  try {
    const { error } = await supabase.from("matches").delete().eq("id", matchId)

    if (error) throw error
    return true
  } catch (err) {
    console.error("[v0] cancelMatch error:", err)
    return false
  }
}
