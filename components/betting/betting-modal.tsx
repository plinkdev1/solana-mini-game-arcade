"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import type React from "react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useBettingStore } from "@/lib/stores/betting-store"
import { X, Loader2 } from "lucide-react"
import type { BettingModalProps } from "@/types/betting-modal-props"
import { useWalletStore } from "@/lib/stores/wallet-store"
import { initiateBet } from "@/lib/services/spl-token-service"

export function BettingModal({ isOpen, onClose, onBetPlaced, gameTitle }: BettingModalProps) {
  const [betAmount, setBetAmount] = useState("0.01")
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()
  const { mockBalance, currentBet, setBet, initializeEscrow, setTransactionPending } = useBettingStore()
  const { isConnected, datxBalance, mockMode, publicKey } = useWalletStore()

  if (!isOpen) return null

  const displayBalance = mockMode ? mockBalance : datxBalance

  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value) || 0

    if (value < 0.01 || value > 0.1) {
      toast({
        title: "Invalid Bet",
        description: "Bet must be between 0.01 and 0.1 $DATX",
        variant: "destructive",
      })
      return
    }

    if (value > displayBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You only have ${displayBalance.toFixed(2)} $DATX`,
        variant: "destructive",
      })
      return
    }

    setBetAmount(value.toString())
    setBet(value)
  }

  const handleBetAndPlay = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to place a bet",
        variant: "destructive",
      })
      return
    }

    const bet = Number.parseFloat(betAmount)
    setIsProcessing(true)

    try {
      const txSignature = await initiateBet(bet, publicKey || "", mockMode)

      if (txSignature) {
        console.log("[v0] Bet initiated with tx signature:", txSignature)

        initializeEscrow(bet, bet)

        toast({
          title: "Bet Placed",
          description: `${bet} $DATX locked in escrow. Game starting...`,
        })

        onBetPlaced(bet)
        onClose()
      }
    } catch (error) {
      console.error("[v0] Bet error:", error)
      toast({
        title: "Bet Failed",
        description: error instanceof Error ? error.message : "Failed to place bet",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <Card className="w-full max-w-md p-6 bg-card border-primary/50 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X size={20} />
        </button>

        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-primary mb-2">{gameTitle}</h2>
            <p className="text-sm text-muted-foreground">Place your bet to challenge another player</p>
          </div>

          <div className="bg-muted/50 p-4 rounded-md border border-primary/20">
            <div className="text-sm text-muted-foreground mb-2">Available Balance</div>
            <div className="text-2xl font-bold text-accent">{displayBalance.toFixed(2)} $DATX</div>
            {!mockMode && <div className="text-xs text-accent mt-1">Real Wallet</div>}
            {mockMode && <div className="text-xs text-muted-foreground mt-1">Mock Mode</div>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bet Amount</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0.01"
                max="0.1"
                step="0.01"
                value={betAmount}
                onChange={handleBetChange}
                className="flex-1"
                disabled={isProcessing}
              />
              <span className="text-muted-foreground">$DATX</span>
            </div>
            <div className="text-xs text-muted-foreground mt-2">Min: 0.01 | Max: 0.1</div>
          </div>

          <div className="bg-destructive/10 p-3 rounded-md border border-destructive/30">
            <p className="text-xs text-destructive">
              If you lose, {(Number.parseFloat(betAmount) * 0.7).toFixed(3)} goes to Treasury,{" "}
              {(Number.parseFloat(betAmount) * 0.3).toFixed(3)} goes to Team.
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent" disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              onClick={handleBetAndPlay}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Bet & Play"
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
