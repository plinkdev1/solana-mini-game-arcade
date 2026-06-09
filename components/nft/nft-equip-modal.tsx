"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { NFTMetadata } from "@/lib/nft/nft-types"
import { getRarityColor } from "@/lib/nft/nft-service"
import Image from "next/image"

interface NFTEquipModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  nfts: NFTMetadata[]
  equipped: NFTMetadata | null
  onEquip: (nft: NFTMetadata) => void
  onUnequip: () => void
}

export function NFTEquipModal({ open, onOpenChange, nfts, equipped, onEquip, onUnequip }: NFTEquipModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md md:max-w-2xl max-h-[80vh] bg-black/95 border border-pink-500/50 backdrop-blur flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl neon-pink text-center">Equip Power-Up Booster</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto gap-4 py-4 px-2 scroll-smooth [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-black/20 [&::-webkit-scrollbar-thumb]:bg-pink-500/40 [&::-webkit-scrollbar-thumb]:hover:bg-pink-500/60 [&::-webkit-scrollbar-thumb]:rounded-full">
          {equipped && (
            <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/30 rounded-lg p-4">
              <p className="text-sm text-gray-300 mb-2">Currently Equipped</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-bold ${getRarityColor(equipped.rarity)}`}>{equipped.name}</p>
                  <p className="text-sm text-gray-400">+{equipped.boostPercentage}% El Shito Chance</p>
                </div>
                <Button
                  onClick={onUnequip}
                  variant="outline"
                  size="sm"
                  className="border-pink-500 hover:bg-pink-500/20 bg-transparent"
                >
                  Unequip
                </Button>
              </div>
            </div>
          )}

          {nfts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No NFTs found in your wallet</p>
              <p className="text-sm text-gray-500 mt-2">Mock mode showing sample NFTs below</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nfts.map((nft) => {
                const rarityConfig = {
                  common: { color: "#22c55e", label: "COMMON", borderClass: "border-green-500/50" },
                  rare: { color: "#3b82f6", label: "RARE", borderClass: "border-blue-500/50" },
                  legendary: { color: "#eab308", label: "LEGENDARY", borderClass: "border-yellow-500/50" },
                }
                const config = rarityConfig[nft.rarity]

                return (
                  <div
                    key={nft.mint}
                    className={`${config.borderClass} border-2 rounded-xl overflow-hidden hover:border-opacity-100 shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer bg-gradient-to-br from-black/80 to-black/40 hover:from-black/70 hover:to-black/30 relative`}
                    style={{
                      boxShadow: `0 0 20px ${config.color}33, inset 0 0 20px ${config.color}0a`,
                    }}
                  >
                    {/* Rarity Badge */}
                    <div
                      className="absolute top-3 right-3 z-10 px-3 py-1 rounded-full text-xs font-bold text-white backdrop-blur-sm border"
                      style={{
                        backgroundColor: `${config.color}22`,
                        borderColor: config.color,
                        color: config.color,
                      }}
                    >
                      {config.label}
                    </div>

                    {/* Image Container */}
                    <div className="relative aspect-square overflow-hidden bg-black/50">
                      <Image
                        src={nft.image || "/placeholder.svg"}
                        alt={nft.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {/* Neon glow overlay on hover */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                        style={{ backgroundColor: config.color }}
                      />
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <div>
                        <p
                          className="font-bold text-base group-hover:brightness-125 transition"
                          style={{ color: config.color }}
                        >
                          {nft.name}
                        </p>
                        <p className="text-xs text-gray-300 mt-1">+{nft.boostPercentage}% Power-Up Boost</p>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">{nft.description}</p>
                      <Button
                        onClick={() => {
                          onEquip(nft)
                          onOpenChange(false)
                        }}
                        className="w-full mt-3 text-white font-bold transition-all duration-200 border-2"
                        style={{
                          backgroundColor: `${config.color}22`,
                          borderColor: config.color,
                          color: config.color,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = `${config.color}44`
                          e.currentTarget.style.boxShadow = `0 0 15px ${config.color}66, inset 0 0 10px ${config.color}22`
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = `${config.color}22`
                          e.currentTarget.style.boxShadow = "none"
                        }}
                      >
                        Equip
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
