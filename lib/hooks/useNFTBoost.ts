import { usePowerUpsStore } from "@/lib/stores/power-ups-store"

/**
 * Hook for games to apply NFT booster effects to power-up calculations
 * Returns functions to calculate boosted power-up chance and check exclusive effects
 */
export function useNFTBoost() {
  const { getNFTBoostMultiplier, getEquippedBoostPercentage, isExclusiveEffectActive, equippedNFT } =
    usePowerUpsStore()

  /**
   * Apply NFT boost to base power-up chance (0-100)
   * Example: 20% base chance with +20% boost = 24% chance (1.2x multiplier)
   */
  const applyBoostToChance = (baseChance: number): number => {
    if (baseChance <= 0) return 0
    const multiplier = getNFTBoostMultiplier()
    const boosted = baseChance * multiplier
    // Cap at 100% max chance
    return Math.min(boosted, 100)
  }

  /**
   * Get total boost percentage from equipped NFT
   */
  const getBoostPercentage = (): number => {
    return getEquippedBoostPercentage()
  }

  /**
   * Check if legendary exclusive effect is active (guaranteed power-up)
   */
  const isGuaranteedPowerUp = (): boolean => {
    return isExclusiveEffectActive("guaranteed") && equippedNFT?.rarity === "legendary"
  }

  /**
   * Check if equipped NFT has preview effect (rare tier)
   */
  const canPreviewPowerUp = (): boolean => {
    return equippedNFT?.rarity === "rare" && equippedNFT?.name?.includes("Bandana")
  }

  return {
    equippedNFT,
    applyBoostToChance,
    getBoostPercentage,
    isGuaranteedPowerUp,
    canPreviewPowerUp,
  }
}
