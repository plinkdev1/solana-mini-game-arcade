"use client"

import { useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import GameDetailModal from "./game-detail-modal"

interface GameCardProps {
  game: {
    id: number
    slug: string
    name: string
    description: string
    lore: string
    betRange: string
    winCondition: string
    image: string
    playerCount: number // added playerCount to game interface
  }
}

const MICROCOPY = [
  "This might rug... your expectations",
  "Click if you dare",
  "Stake here, sink forever",
  "Burn it before it burns you",
  "Connection lost. Blame the government.",
  "Too much shit detected. Try again.",
]

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

export default function GameCard({ game }: GameCardProps) {
  const [showModal, setShowModal] = useState(false)
  const randomTip = MICROCOPY[Math.floor(Math.random() * MICROCOPY.length)]
  const playLink = GAME_ROUTES[game.slug] || `/poop-tac-toe`

  return (
    <>
      <div onClick={() => setShowModal(true)} className="cursor-pointer group">
        <Card className="bg-black/60 backdrop-blur border-2 border-pink-500/50 overflow-hidden hover:shadow-2xl transition-all duration-300 group relative h-full hover:border-pink-400 hover:shadow-[0_0_30px_rgba(233,30,99,0.6)]">
          <div
            className="relative h-48 flex items-center justify-center overflow-hidden bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.75) 0%, rgba(26, 15, 26, 0.8) 50%, rgba(10, 10, 10, 0.75) 100%), url('${game.image}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-pink-900/40" />
            {/* Dripping effect */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 0%, rgba(217, 119, 6, 0.3) 0%, transparent 30%), radial-gradient(circle at 80% 0%, rgba(217, 119, 6, 0.2) 0%, transparent 25%)",
              }}
            />
          </div>

          <div className="p-6">
            <h3 className="text-xl font-black text-pink-400 mb-2">{game.name}</h3>

            <p className="text-sm text-muted-foreground mb-3">{game.description}</p>

            <div className="space-y-2 mb-4 p-3 bg-black/40 rounded border border-pink-500/30 hover:border-pink-400/50 transition-colors">
              <div className="flex justify-between text-xs">
                <span className="text-accent font-bold">Bet Range:</span>
                <span className="text-pink-300">{game.betRange}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-accent font-bold">Win:</span>
                <span className="text-accent">{game.winCondition}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-accent font-bold">Players:</span>
                <span className="text-pink-300">{game.playerCount}</span>
              </div>
            </div>

            <p className="text-xs text-accent italic mb-4 border-l-2 border-accent pl-3">{game.lore}</p>

            <div className="flex gap-2">
              <Link href={playLink} className="flex-1">
                <Button
                  className="w-full bg-pink-500/70 hover:bg-pink-500/90 text-black font-bold transition-all duration-200 hover:shadow-[0_0_20px_rgba(233,30,99,0.6)]"
                  title={randomTip}
                >
                  Play Now
                </Button>
              </Link>
              <Button
                variant="outline"
                className="border-accent/50 hover:border-accent bg-transparent text-accent hover:bg-accent/10"
                onClick={(e) => {
                  e.preventDefault()
                  setShowModal(true)
                }}
              >
                ℹ️
              </Button>
            </div>

            <p className="text-xs text-accent/80 mt-3 text-center font-semibold">✨ El Shito Power-Ups Active ✨</p>
          </div>
        </Card>
      </div>

      {/* Game Detail Modal */}
      <GameDetailModal game={game} open={showModal} onOpenChange={setShowModal} />
    </>
  )
}
