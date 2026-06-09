"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Header from "@/components/header"
import RiskClogBoard from "@/components/games/risk-clog-board"
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

export default function RiskClogPage() {
  const [isBettingModalOpen, setIsBettingModalOpen] = useState(false)
  const [hasPlacedBet, setHasPlacedBet] = useState(false)
  const [betAmount, setBetAmount] = useState(0)
  const { isWalletConnected } = useBettingStore()
  const { isConnected: walletConnected } = useWalletStore()
  const { toast } = useToast()

  const game = {
    name: "Risk the Rats",
    lore: "Command poop troop armies to conquer the sewer territories. First to control all 6 territories wins and flushes the competition down the drain.",
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
      description: `Bet of ${amount} $DATX locked in. Conquer the sewer!`,
    })
  }

  return (
    <main className="min-h-screen bg-background flex flex-col overflow-hidden">
      <Header />

      <div
        className="fixed inset-0 -z-10 top-20"
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(139, 69, 19, 0.15) 0%, transparent 40%),
            radial-gradient(ellipse at 80% 80%, rgba(210, 105, 30, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 0%, rgba(101, 67, 33, 0.08) 0%, transparent 60%),
            linear-gradient(135deg, #3d2a1a 0%, #0a0a0a 50%, #2a1a3d 100%)
          `,
        }}
      />
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-yellow-900/20 via-transparent to-black/60 backdrop-blur-sm top-20" />

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
                <p>💰 Bet: 0.1 $DATX per match</p>
                <p>🗺️ Goal: Control all 6 territories</p>
                <p>💪 Place armies, attack neighbors, expand</p>
                <p>⚔️ Clog Attack: Extra die in combat</p>
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
              <RiskClogBoard gameBet={betAmount} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground mb-4">Place a bet to start Risk the Rats</p>
                <Button onClick={handleStartBetting} className="bg-primary text-black hover:bg-primary/90 font-bold">
                  Place Bet & Play (0.1 $DATX)
                </Button>
              </div>
            )}
          </Card>

          <BettingModal
            isOpen={isBettingModalOpen}
            onClose={() => setIsBettingModalOpen(false)}
            onBetPlaced={handleBetPlaced}
            gameTitle={game.name}
            defaultBetAmount={0.1}
          />
        </div>
      </div>

      <TransactionToast />
      <MockModeIndicator />
    </main>
  )
}
