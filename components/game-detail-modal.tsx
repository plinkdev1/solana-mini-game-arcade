"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import BetAndRoomSelectionModal from "./bet-and-room-selection-modal"

interface GameDetailModalProps {
  game: {
    id: number
    slug: string
    name: string
    description: string
    lore: string
    betRange: string
    winCondition: string
    image: string
    playerCount: number
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

const GAME_ROUTES: Record<string, string> = {
  "tic-tac-toe": "/poop-tac-toe",
  checkers: "/poop-checkers",
  gomoku: "/infinite-poop-gomoku",
  "dots-and-boxes": "/poop-boxes",
  halma: "/poop-halma",
  "nine-mens-morris": "/poop-mills",
  "bubble-shooter": "/bubble-flush",
  chess: "/poop-chess",
  backgammon: "/backgammon-flush",
  dominoes: "/domino-clog",
  "peg-solitaire": "/peg-flush",
  battleship: "/battle-flush",
  ludo: "/ludo-flush",
  go: "/go-clog",
  scrabble: "/scrabble-shit",
  "ticket-to-ride": "/ticket-flush",
  risk: "/risk-clog",
  poker: "/poop-poker",
  rummy: "/rummy-clog",
  uno: "/uno-flush",
}

function getPlayerTypeInfo(playerCount: number) {
  if (playerCount === 1) {
    return {
      label: "SOLO",
      lore: "Battle the sewers alone – no mercy, no allies.",
      icon: "🚽",
      color: "text-cyan-300",
    }
  } else if (playerCount === 2) {
    return {
      label: "HEAD-TO-HEAD",
      lore: "1v1 in the sludge – only one flush remains standing.",
      icon: "⚔️",
      color: "text-pink-300",
    }
  } else if (playerCount >= 3) {
    return {
      label: "MULTIPLAYER",
      lore: `${playerCount} warriors clash in the sewer arena – chaos guaranteed.`,
      icon: "🌪️",
      color: "text-lime-300",
    }
  }
  return {
    label: "UNKNOWN",
    lore: "Unknown waters ahead.",
    icon: "❓",
    color: "text-muted-foreground",
  }
}

export default function GameDetailModal({ game, open, onOpenChange }: GameDetailModalProps) {
  const [betModalOpen, setBetModalOpen] = useState(false)
  const playLink = GAME_ROUTES[game.slug] || `/poop-tac-toe`
  const playerInfo = getPlayerTypeInfo(game.playerCount)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl bg-black/80 backdrop-blur border-2 border-pink-500/50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-pink-400">{game.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Game Image */}
            <div
              className="w-full h-64 rounded-lg overflow-hidden border border-pink-500/30"
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(26, 15, 26, 0.7) 50%), url('${game.image}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />

            {/* Lore Twist Section */}
            <div className="bg-pink-900/20 border-l-4 border-pink-500 p-4 rounded">
              <p className="text-xs font-bold text-accent uppercase mb-2">🎭 Lore Twist</p>
              <p className="text-pink-200 italic">{game.lore}</p>
            </div>

            <div className={`bg-black/40 border-l-4 p-4 rounded ${playerInfo.color}`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{playerInfo.icon}</span>
                <p className="text-xs font-bold uppercase tracking-wider">{playerInfo.label}</p>
              </div>
              <p className="text-sm text-muted-foreground italic">{playerInfo.lore}</p>
            </div>

            {/* Game Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/40 p-4 rounded border border-accent/30">
                <p className="text-xs text-accent font-bold mb-1">BET RANGE</p>
                <p className="text-lg font-bold text-pink-300">{game.betRange}</p>
              </div>
              <div className="bg-black/40 p-4 rounded border border-accent/30">
                <p className="text-xs text-accent font-bold mb-1">WIN CONDITION</p>
                <p className="text-sm font-bold text-accent">{game.winCondition}</p>
              </div>
            </div>

            {/* El Shito Power-Ups Teaser */}
            <div className="bg-gradient-to-r from-pink-900/40 to-amber-900/30 border border-pink-500/50 p-4 rounded">
              <p className="text-sm font-bold text-pink-300 mb-2">⚡ El Shito May Strike!</p>
              <p className="text-xs text-muted-foreground">
                Random power-ups activate during play. Flush opponent pieces, swap positions, block spaces, or grab
                extra turns. 10-20% chance per turn – chaos is guaranteed.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setBetModalOpen(true)}
                className="flex-1 bg-pink-500/70 hover:bg-pink-500/90 text-black font-bold h-12"
              >
                Place Bet & Play
              </Button>
              <Button
                variant="outline"
                className="border-accent text-accent hover:bg-accent/10 bg-transparent"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BetAndRoomSelectionModal open={betModalOpen} onOpenChange={setBetModalOpen} game={game} />
    </>
  )
}
