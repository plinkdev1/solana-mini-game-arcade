export interface NFTMetadata {
  mint: string
  name: string
  symbol: string
  image: string
  rarity: "common" | "rare" | "legendary"
  boostPercentage: number
  description: string
}

export interface EquippedBooster {
  mint: string
  name: string
  boostPercentage: number
  rarity: string
}
