import type { NFTMetadata } from "./nft-types"
import { fetchUserNFTs } from "./mock-nft-data"

export async function getUserNFTs(walletAddress: string | null): Promise<NFTMetadata[]> {
  if (!walletAddress) return []

  try {
    // In production, use Metaplex API
    // const nfts = await metaplex.nfts().findAllByOwner({ owner: walletAddress })

    // Mock mode
    return await fetchUserNFTs(walletAddress)
  } catch (error) {
    console.error("[v0] Error fetching NFTs:", error)
    return []
  }
}

export function getNFTBoostMultiplier(nft: NFTMetadata | null): number {
  if (!nft) return 1.0

  // Cap boost at +50% total
  const boost = 1 + nft.boostPercentage / 100
  return Math.min(boost, 1.5)
}

export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case "common":
      return "text-green-400"
    case "rare":
      return "text-blue-400"
    case "legendary":
      return "text-yellow-400"
    default:
      return "text-gray-400"
  }
}
