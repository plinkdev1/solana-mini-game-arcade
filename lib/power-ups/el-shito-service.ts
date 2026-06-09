import { callOracleRNG } from "../oracle/switchboard-service"
import { getNFTBoostMultiplier } from "@/lib/nft/nft-service"
import { usePowerUpsStore } from "@/lib/stores/power-ups-store"
import { logPowerUpEvent, hashWallet } from "@/lib/supabase/analytics-service"

export interface PowerUp {
  id: string
  type:
    | "flush_strike"
    | "bandana_blind"
    | "poop_swirl"
    | "plunger_pull"
    | "reserve_hole"
    | "clog_jam"
    | "neon_hallucination"
  name: string
  description: string
  cost: number // DATX cost
  effect: (gameState: any) => any
  animation: string
}

export const EL_SHITO_POWER_UPS: Record<string, PowerUp> = {
  flush_strike: {
    id: "flush_strike",
    type: "flush_strike",
    name: "Flush Strike",
    description: "Randomly remove one opponent piece - unclog the board!",
    cost: 0.1,
    effect: (gameState) => {
      // Remove random opponent piece
      return gameState
    },
    animation: "flush-spin",
  },
  bandana_blind: {
    id: "bandana_blind",
    type: "bandana_blind",
    name: "Bandana Blind",
    description: "Hide opponent's next move preview - thug stealth mode!",
    cost: 0.08,
    effect: (gameState) => gameState,
    animation: "eyes-glow",
  },
  poop_swirl: {
    id: "poop_swirl",
    type: "poop_swirl",
    name: "Poop Swirl Vortex",
    description: "Swap two random pieces - everything is shit chaos!",
    cost: 0.12,
    effect: (gameState) => gameState,
    animation: "swirl-vortex",
  },
  plunger_pull: {
    id: "plunger_pull",
    type: "plunger_pull",
    name: "Plunger Pull",
    description: "Pull opponent piece back one space - suck into the hole!",
    cost: 0.09,
    effect: (gameState) => gameState,
    animation: "plunger-suck",
  },
  reserve_hole: {
    id: "reserve_hole",
    type: "reserve_hole",
    name: "Reserve Hole Boost",
    description: "Extra turn for you - tap the reserve for power!",
    cost: 0.15,
    effect: (gameState) => gameState,
    animation: "hole-boost",
  },
  clog_jam: {
    id: "clog_jam",
    type: "clog_jam",
    name: "Clog Jam",
    description: "Block one grid space temporarily - clog the system!",
    cost: 0.07,
    effect: (gameState) => gameState,
    animation: "clog-block",
  },
  neon_hallucination: {
    id: "neon_hallucination",
    type: "neon_hallucination",
    name: "Neon Drip Hallucination",
    description: "Randomly rearrange 3 pieces - psychedelic high!",
    cost: 0.11,
    effect: (gameState) => gameState,
    animation: "neon-rearrange",
  },
}

export async function shouldTriggerPowerUp(gameId?: string, useOracle = false): Promise<boolean> {
  const { equippedNFT } = usePowerUpsStore.getState()
  const nftMultiplier = getNFTBoostMultiplier(equippedNFT as any)

  if (useOracle && gameId) {
    const result = await callOracleRNG(gameId)
    const adjustedChance = 15 * nftMultiplier // Apply boost
    return result.randomValue % 100 < adjustedChance
  }

  // Fallback to client-side random with NFT boost
  return Math.random() < 0.15 * nftMultiplier
}

export async function logPowerUpTrigger(
  gameId: string,
  gameType: string,
  powerUpType: string,
  walletAddress: string,
  userId?: string,
  gameOutcome?: "win" | "loss",
) {
  const { equippedNFT } = usePowerUpsStore.getState()
  const nftMultiplier = getNFTBoostMultiplier(equippedNFT as any)

  await logPowerUpEvent({
    user_id: userId,
    wallet_hash: hashWallet(walletAddress),
    game_id: gameId,
    game_type: gameType,
    power_up_type: powerUpType,
    game_outcome: gameOutcome,
    boost_active: nftMultiplier > 1,
    boost_percentage: Math.round((nftMultiplier - 1) * 100),
    nft_equipped: equippedNFT?.name || null,
  })
}

export function getRandomPowerUp(): PowerUp {
  const powerUps = Object.values(EL_SHITO_POWER_UPS)
  return powerUps[Math.floor(Math.random() * powerUps.length)]
}

export function validatePowerUp(powerUpId: string): PowerUp | null {
  return EL_SHITO_POWER_UPS[powerUpId] || null
}
