import { supabase } from "./client"

export type NFTRarity = "common" | "rare" | "legendary"

// Mock NFT holding check (future: use getTokenAccountsByOwner for Sewer Rebels collection)
export async function checkSewerRebelsNFT(wallet: string): Promise<{ holds: boolean; rarity?: NFTRarity }> {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("holds_sewer_rebels_nft, nft_rarity")
      .eq("wallet_address", wallet)
      .single()

    if (error || !user) return { holds: false }

    if (!user.holds_sewer_rebels_nft) return { holds: false }

    return {
      holds: true,
      rarity: (user.nft_rarity as NFTRarity) || "common",
    }
  } catch (err) {
    console.error("[v0] checkSewerRebelsNFT error:", err)
    return { holds: false }
  }
}

// Get NFT power-up bonus percentage
export function getNFTPowerUpBonus(rarity?: NFTRarity): number {
  switch (rarity) {
    case "rare":
      return 5 // +5% power-up chance
    case "legendary":
      return 10 // +10% power-up chance
    default:
      return 0 // Common or no NFT
  }
}

// Mock: Simulate holding NFT (for testing)
export async function mockSetSewerRebelsNFT(wallet: string, rarity: NFTRarity): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("users")
      .update({
        holds_sewer_rebels_nft: true,
        nft_rarity: rarity,
      })
      .eq("wallet_address", wallet)

    return !error
  } catch (err) {
    console.error("[v0] mockSetSewerRebelsNFT error:", err)
    return false
  }
}
