"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { NFTEquipModal } from "./nft-equip-modal"
import type { NFTMetadata } from "@/lib/nft/nft-types"
import { getUserNFTs } from "@/lib/nft/nft-service"
import { usePowerUpsStore } from "@/lib/stores/power-ups-store"

export function EquipBoosterButton() {
  const [open, setOpen] = useState(false)
  const [nfts, setNfts] = useState<NFTMetadata[]>([])
  const [equipped, setEquipped] = useState<NFTMetadata | null>(null)
  const { equippedNFT, setEquippedNFT } = usePowerUpsStore()
  const { toast } = useToast()

  useEffect(() => {
    // Load user's NFTs (mock wallet address)
    const loadNFTs = async () => {
      const userNFTs = await getUserNFTs("mock-wallet-address")
      setNfts(userNFTs)
    }

    loadNFTs()

    // Load equipped NFT from store
    if (equippedNFT) {
      setEquipped(equippedNFT as any)
    }
  }, [equippedNFT])

  const handleEquip = (nft: NFTMetadata) => {
    setEquipped(nft)
    setEquippedNFT(nft)

    // Show success toast with boost info
    const tierEmoji = nft.rarity === "legendary" ? "👑" : nft.rarity === "rare" ? "💎" : "⭐"
    toast({
      title: `${tierEmoji} Boost Equipped!`,
      description: `${nft.name} active (+${nft.boostPercentage}% Power-Up chance)`,
      duration: 3000,
    })

    // Close modal after equip
    setOpen(false)
  }

  const handleUnequip = () => {
    const previousName = equipped?.name
    setEquipped(null)
    setEquippedNFT(null)

    // Show unequip toast
    toast({
      title: "Booster Unequipped",
      description: `${previousName} removed. Back to baseline power-ups.`,
      duration: 2000,
    })
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="relative bg-gradient-to-br from-pink-700 via-amber-900 to-pink-800 hover:from-pink-600 hover:via-amber-800 hover:to-pink-700 border border-pink-500 text-white font-bold shadow-lg shadow-pink-500/50 hover:shadow-pink-500/80 transition-all duration-300 overflow-hidden group"
      >
        {/* Dripping sludge effect on hover */}
        <span className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <span className="absolute top-0 right-0 w-1 h-0 bg-amber-600/60 group-hover:h-full transition-all duration-500 origin-top opacity-0 group-hover:opacity-70" />
        <span className="relative z-10">
          {equipped ? (
            <span>
              ✨ {equipped.name} (+{equipped.boostPercentage}%)
            </span>
          ) : (
            <span>⚡ Equip Booster</span>
          )}
        </span>
      </Button>

      <NFTEquipModal
        open={open}
        onOpenChange={setOpen}
        nfts={nfts}
        equipped={equipped}
        onEquip={handleEquip}
        onUnequip={handleUnequip}
      />
    </>
  )
}
