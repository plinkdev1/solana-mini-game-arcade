"use client"

import { Card } from "@/components/ui/card"
import { useBettingStore } from "@/lib/stores/betting-store"
import { useWalletStore } from "@/lib/stores/wallet-store"

export function StatsDisplay() {
  const {
    mockBalance = 0,
    treasuryBalance = 0,
    teamBalance = 0,
    isWalletConnected,
    isHydrated: bettingHydrated,
  } = useBettingStore()
  const { isConnected, datxBalance = 0, mockMode, publicKey, isHydrated: walletHydrated } = useWalletStore()

  // Don't render until stores are hydrated
  if (!bettingHydrated || !walletHydrated) {
    return null
  }

  const connected = isWalletConnected || isConnected

  if (!connected) {
    return null
  }

  const displayBalance = mockMode ? (mockBalance ?? 0) : (datxBalance ?? 0)

  return (
    <div className="grid grid-cols-3 gap-2 text-xs">
      <Card className="p-3 bg-muted/50 border-primary/20">
        <div className="text-muted-foreground mb-1">Wallet</div>
        <div className="text-sm font-bold text-accent">{(displayBalance ?? 0).toFixed(2)} $DATX</div>
        {!mockMode && publicKey && (
          <div className="text-xs text-muted-foreground mt-1 truncate">{publicKey.slice(0, 8)}</div>
        )}
      </Card>

      <Card className="p-3 bg-muted/50 border-primary/20">
        <div className="text-muted-foreground mb-1">Treasury</div>
        <div className="text-sm font-bold text-pink-500">{(treasuryBalance ?? 0).toFixed(2)} $DATX</div>
      </Card>

      <Card className="p-3 bg-muted/50 border-primary/20">
        <div className="text-muted-foreground mb-1">Team</div>
        <div className="text-sm font-bold text-green-500">{(teamBalance ?? 0).toFixed(2)} $DATX</div>
      </Card>
    </div>
  )
}
