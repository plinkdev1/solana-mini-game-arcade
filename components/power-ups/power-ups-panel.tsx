"use client"

import { useState } from "react"
import { usePowerUpsStore } from "@/lib/stores/power-ups-store"
import { PowerUpsShopModal } from "./power-ups-shop-modal"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Toggle } from "@/components/ui/toggle"

interface PowerUpsPanelProps {
  onOpenPowerUps?: () => void
  gameId?: string
}

export function PowerUpsPanel({ onOpenPowerUps, gameId = "default" }: PowerUpsPanelProps) {
  const { powerUpsEnabled, togglePowerUps, mockBalance, equippedNFT } = usePowerUpsStore()
  const [shopOpen, setShopOpen] = useState(false)

  return (
    <>
      <Card className="border-pink-500/50 bg-black/70 backdrop-blur-sm p-4 space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-cyan-400">El Shito Power-Ups</h3>
          <p className="text-xs text-muted-foreground">Random lore twists during gameplay (10-20% chance)</p>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-foreground">Your Balance:</span>
          <span className="font-mono text-lime-400">{mockBalance.toFixed(2)} $DATX</span>
        </div>

        {equippedNFT && (
          <div className="flex items-center justify-between text-xs bg-lime-400/10 p-2 rounded border border-lime-400/30">
            <span className="text-foreground">Equipped Booster:</span>
            <span className="text-lime-400 font-bold">{equippedNFT.name}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-foreground">Power-Ups:</span>
          <Toggle
            pressed={powerUpsEnabled}
            onPressedChange={togglePowerUps}
            className="data-[state=on]:bg-lime-400 data-[state=on]:text-black"
          >
            {powerUpsEnabled ? "ON" : "OFF"}
          </Toggle>
        </div>

        {powerUpsEnabled && (
          <div className="space-y-2">
            <Button
              onClick={() => setShopOpen(true)}
              size="sm"
              className="w-full bg-gradient-to-r from-pink-500 to-cyan-400 hover:from-pink-600 hover:to-cyan-500 text-black text-xs font-bold"
            >
              🛍️ Open Power-Ups Shop
            </Button>

            {onOpenPowerUps && (
              <Button onClick={onOpenPowerUps} size="sm" variant="outline" className="w-full text-xs bg-transparent">
                View Triggered Power-Ups
              </Button>
            )}
          </div>
        )}

        <p className="text-xs text-muted-foreground italic">
          💡 Tip: Power-ups only trigger when you have an active bet! Purchase to unlock for this game.
        </p>
      </Card>

      <PowerUpsShopModal isOpen={shopOpen} onClose={() => setShopOpen(false)} gameId={gameId} />
    </>
  )
}
