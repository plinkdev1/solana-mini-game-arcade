import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { NFTMetadata } from "@/lib/nft/nft-types"

interface PowerUpsStore {
  powerUpsEnabled: boolean
  togglePowerUps: () => void
  powerUpsCost: number
  setPowerUpsCost: (cost: number) => void
  oracleMode: boolean
  setOracleMode: (enabled: boolean) => void
  equippedNFT: NFTMetadata | null
  setEquippedNFT: (nft: NFTMetadata | null) => void
  nftBoostMultiplier: number
  getNFTBoostMultiplier: () => number
  getEquippedBoostPercentage: () => number
  mockBalance: number
  setMockBalance: (balance: number) => void
  deductBalance: (amount: number) => void
  addMockBalance: (amount: number) => void
  purchasedPowerUps: Record<string, string[]>
  addPurchasedPowerUp: (gameId: string, powerUpId: string) => void
  clearPurchasedPowerUps: (gameId: string) => void
  isExclusiveEffectActive: (effect: string) => boolean
}

export const usePowerUpsStore = create<PowerUpsStore>()(
  persist(
    (set, get) => ({
      powerUpsEnabled: true,
      togglePowerUps: () => set((state) => ({ powerUpsEnabled: !state.powerUpsEnabled })),
      powerUpsCost: 0.1,
      setPowerUpsCost: (cost: number) => set({ powerUpsCost: cost }),
      oracleMode: false,
      setOracleMode: (enabled: boolean) => set({ oracleMode: enabled }),
      equippedNFT: null,
      setEquippedNFT: (nft: NFTMetadata | null) => set({ equippedNFT: nft }),
      nftBoostMultiplier: 1.0,
      getNFTBoostMultiplier: () => {
        const { equippedNFT } = get()
        if (!equippedNFT) return 1.0
        // Convert percentage to multiplier (20% boost = 1.2x)
        return 1 + equippedNFT.boostPercentage / 100
      },
      getEquippedBoostPercentage: () => {
        const { equippedNFT } = get()
        return equippedNFT?.boostPercentage ?? 0
      },
      mockBalance: 1.0, // Start with 1 $DATX for testing
      setMockBalance: (balance: number) => set({ mockBalance: balance }),
      deductBalance: (amount: number) =>
        set((state) => ({
          mockBalance: Math.max(0, state.mockBalance - amount),
        })),
      addMockBalance: (amount: number) =>
        set((state) => ({
          mockBalance: state.mockBalance + amount,
        })),
      purchasedPowerUps: {},
      addPurchasedPowerUp: (gameId: string, powerUpId: string) =>
        set((state) => ({
          purchasedPowerUps: {
            ...state.purchasedPowerUps,
            [gameId]: [...(state.purchasedPowerUps[gameId] || []), powerUpId],
          },
        })),
      clearPurchasedPowerUps: (gameId: string) =>
        set((state) => {
          const newPurchased = { ...state.purchasedPowerUps }
          delete newPurchased[gameId]
          return { purchasedPowerUps: newPurchased }
        }),
      isExclusiveEffectActive: (effect: string) => {
        const { equippedNFT } = get()
        if (!equippedNFT) return false
        // Check if the equipped NFT has a specific exclusive effect
        return equippedNFT.rarity === "legendary" && effect === "guaranteed"
      },
    }),
    {
      name: "sewer-arena-power-ups",
    },
  ),
)
