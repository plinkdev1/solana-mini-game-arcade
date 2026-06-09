import { createBrowserClient } from "@supabase/ssr"
import crypto from "crypto"

const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export interface PowerUpEvent {
  user_id?: string | null
  wallet_hash: string
  game_id: string
  game_type: string
  power_up_type: string
  game_outcome?: "win" | "loss"
  boost_active: boolean
  boost_percentage: number
  nft_equipped?: string | null
}

// Hash wallet address for privacy
export function hashWallet(walletAddress: string): string {
  return crypto.createHash("sha256").update(walletAddress).digest("hex")
}

// Log power-up event to Supabase
export async function logPowerUpEvent(event: PowerUpEvent): Promise<boolean> {
  try {
    const { error } = await supabase.from("powerup_events").insert({
      user_id: event.user_id || null,
      wallet_hash: event.wallet_hash,
      game_id: event.game_id,
      game_type: event.game_type,
      power_up_type: event.power_up_type,
      game_outcome: event.game_outcome || null,
      boost_active: event.boost_active,
      boost_percentage: event.boost_percentage,
      nft_equipped: event.nft_equipped || null,
      triggered_at: new Date().toISOString(),
    })

    if (error) {
      console.error("[v0] logPowerUpEvent error:", error)
      return false
    }
    return true
  } catch (err) {
    console.error("[v0] logPowerUpEvent exception:", err)
    return false
  }
}

// Get power-up stats for admin dashboard
export async function getPowerUpStats(days = 7) {
  try {
    const since = new Date()
    since.setDate(since.getDate() - days)

    // Total power-ups triggered
    const { data: totalEvents } = await supabase
      .from("powerup_events")
      .select("*", { count: "exact", head: false })
      .gte("triggered_at", since.toISOString())

    // Power-ups by type
    const { data: byType } = await supabase
      .from("powerup_events")
      .select("power_up_type")
      .gte("triggered_at", since.toISOString())

    // Win rate with power-ups active
    const { data: withBoost } = await supabase
      .from("powerup_events")
      .select("game_outcome")
      .eq("boost_active", true)
      .gte("triggered_at", since.toISOString())

    const typeMap = new Map<string, number>()
    byType?.forEach((event: any) => {
      typeMap.set(event.power_up_type, (typeMap.get(event.power_up_type) || 0) + 1)
    })

    const wins = withBoost?.filter((e: any) => e.game_outcome === "win").length || 0
    const total = withBoost?.length || 0
    const winRate = total > 0 ? (wins / total) * 100 : 0

    return {
      total: totalEvents?.[0]?.count || 0,
      byType: Object.fromEntries(typeMap),
      boostedWinRate: winRate.toFixed(2),
      daysTracked: days,
    }
  } catch (err) {
    console.error("[v0] getPowerUpStats error:", err)
    return null
  }
}

// Subscribe to real-time power-up events
export function subscribeToPowerUpEvents(callback: (event: any) => void) {
  const channel = supabase
    .channel("powerup_events_realtime")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "powerup_events",
      },
      (payload) => {
        callback(payload.new)
      },
    )
    .subscribe()

  return channel
}
