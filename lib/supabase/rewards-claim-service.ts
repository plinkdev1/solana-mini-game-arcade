import { createBrowserClient } from "@supabase/ssr"

const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export interface RewardsClaim {
  id: string
  user_id: string
  month: number
  year: number
  claimed: boolean
  amount: number
  nft_minted: boolean
  nft_type?: string
  claimed_at?: string
}

export async function claimMonthlyRewards(userId: string, amount: number, nftType = "Rare") {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const { data, error } = await supabase
    .from("rewards_claims")
    .upsert(
      {
        user_id: userId,
        month,
        year,
        claimed: true,
        amount,
        nft_minted: true,
        nft_type: nftType,
        claimed_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,month,year",
      },
    )
    .select()

  if (error) {
    console.error("[v0] Error claiming rewards:", error)
    throw error
  }

  return data?.[0] as RewardsClaim
}

export async function getPlayerRewardsClaim(userId: string) {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const { data, error } = await supabase
    .from("rewards_claims")
    .select("*")
    .eq("user_id", userId)
    .eq("month", month)
    .eq("year", year)
    .single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows found (expected for new month)
    console.error("[v0] Error fetching reward claim:", error)
  }

  return data as RewardsClaim | null
}

export async function subscribeToRewardsClaim(userId: string, callback: (claim: RewardsClaim) => void) {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const subscription = supabase
    .from("rewards_claims")
    .on(
      "*",
      {
        event: "*",
        schema: "public",
        table: "rewards_claims",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        if (payload.new) {
          callback(payload.new as RewardsClaim)
        }
      },
    )
    .subscribe()

  return subscription
}
