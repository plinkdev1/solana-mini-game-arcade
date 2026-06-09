"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { usePowerUpsStore } from "@/lib/stores/power-ups-store"
import { EL_SHITO_POWER_UPS, type PowerUp } from "@/lib/power-ups/el-shito-service"
import { useToast } from "@/hooks/use-toast"

interface PowerUpsShopModalProps {
  isOpen: boolean
  onClose: () => void
  gameId: string
}

export function PowerUpsShopModal({ isOpen, onClose, gameId }: PowerUpsShopModalProps) {
  const { toast } = useToast()
  const { purchasedPowerUps, mockBalance, deductBalance, addPurchasedPowerUp, nftBoostMultiplier } = usePowerUpsStore()
  const [purchasing, setPurchasing] = useState<string | null>(null)

  const handleBuy = async (powerUp: PowerUp) => {
    setPurchasing(powerUp.id)

    const discountedCost = powerUp.cost * Math.max(0.5, 2 - nftBoostMultiplier)

    // Check balance
    if (mockBalance < discountedCost) {
      toast({
        title: "Insufficient Balance",
        description: `Need ${discountedCost} $DATX, you have ${mockBalance}`,
        variant: "destructive",
      })
      setPurchasing(null)
      return
    }

    // Deduct from mock balance
    deductBalance(discountedCost)
    addPurchasedPowerUp(gameId, powerUp.id)

    // Toast confirmation
    toast({
      title: "🚽 Flushed Purchase!",
      description: `${powerUp.name} unlocked for this game (Cost: ${discountedCost.toFixed(2)} $DATX)`,
      className: "bg-black border-2 border-cyan-400",
    })

    setPurchasing(null)

    // Log to analytics (optional)
    // await logPowerUpPurchase(gameId, powerUp.id, discountedCost)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl border-2 border-pink-500 bg-black/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-cyan-400 to-lime-400">
            💩 El Shito Power-Ups Shop 💩
          </DialogTitle>
        </DialogHeader>

        {/* Balance Display */}
        <div className="flex items-center justify-between bg-gradient-to-r from-pink-500/20 to-cyan-400/20 p-3 rounded-lg border border-pink-500/30">
          <span className="text-sm font-bold text-cyan-400">Your Balance:</span>
          <span className="text-lg font-mono text-lime-400">{mockBalance.toFixed(2)} $DATX</span>
        </div>

        {/* Power-Ups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {Object.values(EL_SHITO_POWER_UPS).map((powerUp) => {
            const isPurchased = purchasedPowerUps[gameId]?.includes(powerUp.id)
            const discountedCost = powerUp.cost * Math.max(0.5, 2 - nftBoostMultiplier)

            return (
              <Card key={powerUp.id} className="border-cyan-500/40 bg-black/50 hover:bg-black/70 p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-cyan-400 text-sm">{powerUp.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{powerUp.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-pink-400">
                    {nftBoostMultiplier > 1 ? (
                      <>
                        <span className="line-through">{powerUp.cost}</span> {discountedCost.toFixed(2)}
                      </>
                    ) : (
                      powerUp.cost.toFixed(2)
                    )}{" "}
                    $DATX
                  </span>
                  {nftBoostMultiplier > 1 && <span className="text-lime-400 font-bold">NFT -50%</span>}
                </div>

                {isPurchased ? (
                  <Button disabled size="sm" className="w-full bg-lime-400/30 text-lime-400">
                    ✓ Purchased
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleBuy(powerUp)}
                    disabled={purchasing !== null || mockBalance < discountedCost}
                    size="sm"
                    className="w-full bg-gradient-to-r from-pink-500 to-cyan-400 hover:from-pink-600 hover:to-cyan-500 text-black text-xs font-bold"
                  >
                    {purchasing === powerUp.id ? "Buying..." : "Buy Now"}
                  </Button>
                )}
              </Card>
            )
          })}
        </div>

        <div className="text-xs text-muted-foreground text-center">
          💡 Purchased power-ups are unlocked for this game session only. Use them strategically!
        </div>

        <Button onClick={onClose} variant="outline" className="w-full bg-transparent">
          Close Shop
        </Button>
      </DialogContent>
    </Dialog>
  )
}
