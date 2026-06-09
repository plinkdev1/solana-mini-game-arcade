import { supabase } from "@/lib/supabase/client"
import { checkSewerRebelsNFT } from "./nft-holding-service"
import { isRateLimited } from "./game-activity-service"

export interface HighRollerEligibility {
  eligible: boolean
  balance?: number
  minHold?: number
  hasNFT?: boolean
  nftRarity?: string
  gamesThisHour?: number
  maxGames?: number
  reasons: string[]
}

export async function checkHighRollerEligibility(walletAddress: string): Promise<HighRollerEligibility> {
  const reasons: string[] = []
  let eligible = true

  // Check balance
  const { data: user, error } = await supabase
    .from("users")
    .select("datx_balance_mock, high_roller_min_hold")
    .eq("wallet_address", walletAddress)
    .single()

  if (error || !user) {
    return {
      eligible: false,
      reasons: ["User not found"],
    }
  }

  const minHold = user.high_roller_min_hold || 100
  const balance = user.datx_balance_mock || 0

  if (balance < minHold) {
    eligible = false
    reasons.push(`Insufficient balance: ${balance} / ${minHold} $DATX required`)
  }

  // Check NFT hold
  const nftStatus = await checkSewerRebelsNFT(walletAddress)
  if (!nftStatus.holds) {
    eligible = false
    reasons.push("No Sewer Rebels NFT detected (required for high roller)")
  }

  // Check rate limit (3 high roller games per hour)
  const rateLimited = await isRateLimited(walletAddress)
  let gamesThisHour = 0
  if (rateLimited) {
    gamesThisHour = await getHighRollerGamesThisHour(walletAddress)
    eligible = false
    reasons.push(`Rate limited: ${gamesThisHour} / 3 high roller games this hour`)
  }

  return {
    eligible,
    balance,
    minHold,
    hasNFT: nftStatus.holds,
    nftRarity: nftStatus.rarity,
    gamesThisHour,
    maxGames: 3,
    reasons,
  }
}

export async function getHighRollerGamesThisHour(wallet: string): Promise<number> {
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
    console.error("[v0] getHighRollerGamesThisHour error:", err)
    return 0
  }
}

export async function getHighRollerBalance(walletAddress: string): Promise<number> {
  const { data: user } = await supabase
    .from("users")
    .select("datx_balance_mock")
    .eq("wallet_address", walletAddress)
    .single()

  return user?.datx_balance_mock || 0
}

export async function getHighRollerMinHold(walletAddress: string): Promise<number> {
  const { data: user } = await supabase
    .from("users")
    .select("high_roller_min_hold")
    .eq("wallet_address", walletAddress)
    .single()

  return user?.high_roller_min_hold || 100
}
