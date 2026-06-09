import { supabase } from "@/lib/supabase/client"

export interface AIGameResult {
  playerWon: boolean
  moveCount: number
  duration: number
}

export class AIService {
  static async recordAIGameResult(
    userId: string | undefined,
    gameType: string,
    difficulty: "easy" | "hard",
    result: AIGameResult,
  ) {
    if (!userId) return

    try {
      const { data: existing } = await supabase
        .from("ai_stats")
        .select("*")
        .eq("user_id", userId)
        .eq("game_type", gameType)
        .eq("ai_difficulty", difficulty)
        .single()

      if (existing) {
        // Update existing stats
        await supabase
          .from("ai_stats")
          .update({
            wins: result.playerWon ? existing.wins + 1 : existing.wins,
            losses: !result.playerWon ? existing.losses + 1 : existing.losses,
            avg_duration_seconds: Math.round(
              (existing.avg_duration_seconds * (existing.wins + existing.losses) + result.duration) /
                (existing.wins + existing.losses + 1),
            ),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
      } else {
        // Create new stats record
        await supabase.from("ai_stats").insert({
          user_id: userId,
          game_type: gameType,
          ai_difficulty: difficulty,
          wins: result.playerWon ? 1 : 0,
          losses: !result.playerWon ? 1 : 0,
          avg_duration_seconds: result.duration,
        })
      }
    } catch (error) {
      console.error("[v0] Failed to record AI game result:", error)
    }
  }

  static async getAIStats(userId: string | undefined, gameType: string) {
    if (!userId) return null

    try {
      const { data } = await supabase.from("ai_stats").select("*").eq("user_id", userId).eq("game_type", gameType)

      return data || null
    } catch (error) {
      console.error("[v0] Failed to fetch AI stats:", error)
      return null
    }
  }
}
