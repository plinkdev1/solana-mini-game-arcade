"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Header from "@/components/header"
import LudoFlushBoard from "@/components/games/ludo-flush-board"
import { BettingModal } from "@/components/betting/betting-modal"
import { WalletConnectButton } from "@/components/betting/wallet-connect-button"
import { StatsDisplay } from "@/components/betting/stats-display"
import { TransactionHistory } from "@/components/betting/transaction-history"
import { TransactionToast } from "@/components/betting/transaction-toast"
import { MockModeIndicator } from "@/components/betting/mock-mode-indicator"
import { useState } from "react"
import { useBettingStore } from "@/lib/stores/betting-store"
import { useWalletStore } from "@/lib/stores/wallet-store"
import { useToast } from "@/hooks/use-toast"

export default function LudoFlushPage() {
  const [isBettingModalOpen, setIsBettingModalOpen] = useState(false)
  const [hasPlacedBet, setHasPlacedBet] = useState(false)
  const [betAmount, setBetAmount] = useState(0)
  const { isWalletConnected } = useBettingStore()
  const { isConnected: walletConnected } = useWalletStore()
  const { toast } = useToast()

  const game = {
    name: "Ludo Leak",
    lore: "Race your pieces home through the sewer before they drown. Flush them all home to victory.",
  }

  const handleStartBetting = () => {
    const connected = isWalletConnected || walletConnected
    if (!connected) {
      toast({
        title: "Wallet Not Connected",
        description: "Connect your wallet to place bets",
        variant: "destructive",
      })
      return
    }
    setIsBettingModalOpen(true)
  }

  const handleBetPlaced = (amount: number) => {
    setBetAmount(amount)
    setHasPlacedBet(true)
    setIsBettingModalOpen(false)
    toast({
      title: "Game Started",
      description: `Bet of ${amount} $DATX locked in. Rush home!`,
    })
  }

  return (
    <main className="min-h-screen bg-background flex flex-col overflow-hidden">
      <Header />

      <div
        className="fixed inset-0 -z-10 top-20"
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(233, 30, 99, 0.15) 0%, transparent 40%),
            radial-gradient(ellipse at 80% 80%, rgba(255, 64, 129, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 0%, rgba(139, 69, 19, 0.08) 0%, transparent 60%),
            linear-gradient(135deg, #2f0a1a 0%, #0a0a0a 50%, #1f0a2f 100%)
          `,
        }}
      />
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-pink-900/20 via-transparent to-black/60 backdrop-blur-sm top-20" />

      <div className="relative z-10 flex-1 py-8 px-4 lg:px-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <Link href="/games" className="inline-block mb-8">
            <Button
              variant="outline"
              className="border-accent/50 hover:border-accent bg-transparent text-accent hover:text-accent hover:bg-accent/10 transition"
            >
              ← Back to Game Select
            </Button>
          </Link>

          <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-8">
            <div className="flex-1">
              <h1 className="text-4xl lg:text-5xl font-black text-primary mb-2 neon-pink text-balance">{game.name}</h1>
              <p className="text-accent italic border-l-2 border-accent pl-4 text-sm">{game.lore}</p>
              <div className="mt-4 text-xs text-muted-foreground space-y-1">
                <p>💰 Bet: 0.04 $DATX per match</p>
                <p>🎯 Goal: Race all pieces home first</p>
                <p>🎲 Roll dice to move (6 to start, doubles roll again)</p>
                <p>⚡ Plunger Roll power-up grants extra roll</p>
                <p>🏠 58 positions to home + safe haven</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 min-w-fit w-full lg:w-auto">
              <WalletConnectButton />
              <StatsDisplay />
              <TransactionHistory />
            </div>
          </div>

          <Card className="glow-border bg-black/60 backdrop-blur border-2 p-4 lg:p-8 mb-8">
            {hasPlacedBet ? (
              <LudoFlushBoard gameBet={betAmount} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground mb-4">Place a bet to start Ludo Leak</p>
                <Button onClick={handleStartBetting} className="bg-primary text-black hover:bg-primary/90 font-bold">
                  Place Bet & Play (0.04 $DATX)
                </Button>
              </div>
            )}
          </Card>

          <BettingModal
            isOpen={isBettingModalOpen}
            onClose={() => setIsBettingModalOpen(false)}
            onBetPlaced={handleBetPlaced}
            gameTitle={game.name}
            defaultBetAmount={0.04}
          />
        </div>
      </div>

      <TransactionToast />
      <MockModeIndicator />
    </main>
  )
}
