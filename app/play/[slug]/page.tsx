"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Header from "@/components/header"
import TicTacToeBoard from "@/components/games/tic-tac-toe-board"
import CheckersBoard from "@/components/games/checkers-board"
import GomokuBoard from "@/components/games/gomoku-board"
import DotsAndBoxesBoard from "@/components/games/dots-and-boxes-board"
import HalmaBoard from "@/components/games/halma-board"
import NineMensMorrisBoard from "@/components/games/nine-mens-morris-board"
import { BettingModal } from "@/components/betting/betting-modal"
import { WalletConnectButton } from "@/components/betting/wallet-connect-button"
import { StatsDisplay } from "@/components/betting/stats-display"
import { TransactionHistory } from "@/components/betting/transaction-history"
import { useState } from "react"
import { useBettingStore } from "@/lib/stores/betting-store"
import { useWalletStore } from "@/lib/stores/wallet-store"
import { useToast } from "@/hooks/use-toast"

const GAME_DATA = {
  "tic-tac-toe": {
    name: "Poop-Tac-Toe",
    lore: "The shittiest strategy game ever made.",
    board: TicTacToeBoard,
  },
  checkers: {
    name: "Checker Diarrhea",
    lore: "Your pieces get flushed one by one.",
    board: CheckersBoard,
  },
  gomoku: {
    name: "Gomoku Sludge",
    lore: "Get five in a row before the swamp fills.",
    board: GomokuBoard,
  },
  "dots-and-boxes": {
    name: "Dots & Feces",
    lore: "Draw lines. Own shit. Lose everything.",
    board: DotsAndBoxesBoard,
  },
  halma: {
    name: "Halma Hell",
    lore: "Race across the sewer. Someone always drowns.",
    board: HalmaBoard,
  },
  "nine-mens-morris": {
    name: "Nine Shit Morris",
    lore: "Mill your opponent or get milled.",
    board: NineMensMorrisBoard,
  },
}

export default function PlayPage() {
  const params = useParams()
  const slug = params.slug as string
  const game = GAME_DATA[slug as keyof typeof GAME_DATA]

  const [isBettingModalOpen, setIsBettingModalOpen] = useState(false)
  const [hasPlacedBet, setHasPlacedBet] = useState(false)
  const [betAmount, setBetAmount] = useState(0)
  const { isWalletConnected, mockBalance } = useBettingStore()
  const { isConnected: walletConnected } = useWalletStore()
  const { toast } = useToast()

  if (!game) {
    return (
      <main className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-black text-primary mb-4">Game Not Found</h1>
            <Link href="/games">
              <Button className="bg-primary text-black hover:bg-primary/90">Back to Games</Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const BoardComponent = game.board

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
      description: `Bet of ${amount} $DATX locked in. Good luck!`,
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
            radial-gradient(ellipse at 80% 80%, rgba(0, 255, 65, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 0%, rgba(255, 0, 255, 0.1) 0%, transparent 60%),
            linear-gradient(135deg, #1a0f1a 0%, #0a0a0a 50%, #0f1a0a 100%)
          `,
        }}
      />
      <div className="fixed inset-0 -z-10 bg-red-900/80 backdrop-blur-sm top-20" />

      <div className="relative z-10 flex-1 py-8 px-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <Link href="/games" className="inline-block mb-8">
            <Button
              variant="outline"
              className="border-accent/50 hover:border-accent bg-transparent text-accent hover:text-accent hover:bg-accent/10 transition"
            >
              ← Back to Game Select
            </Button>
          </Link>

          <div className="flex justify-between items-start gap-8 mb-8">
            <div className="flex-1">
              <h1 className="text-5xl font-black text-primary mb-2 neon-pink text-balance">{game.name}</h1>
              <p className="text-accent italic border-l-2 border-accent pl-4 text-sm">{game.lore}</p>
            </div>
            <div className="flex flex-col gap-3 min-w-fit">
              <WalletConnectButton />
              <StatsDisplay />
              <TransactionHistory />
            </div>
          </div>

          {/* Game Board Card */}
          <Card className="glow-border bg-black/60 backdrop-blur border-2 p-8 mb-8">
            {hasPlacedBet ? (
              <BoardComponent gameBet={betAmount} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground mb-4">Place a bet to start playing</p>
                <Button onClick={handleStartBetting} className="bg-primary text-black hover:bg-primary/90 font-bold">
                  Place Bet & Play
                </Button>
              </div>
            )}
          </Card>

          <BettingModal
            isOpen={isBettingModalOpen}
            onClose={() => setIsBettingModalOpen(false)}
            onBetPlaced={handleBetPlaced}
            gameTitle={game.name}
          />
        </div>
      </div>
    </main>
  )
}
