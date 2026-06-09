"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface CoinFlipModalProps {
  isOpen: boolean
  onResult: (player: number) => void
  playerCount?: number // Added playerCount prop to support multiplayer games
}

const PLAYER_EMOJIS = ["💩", "🚽", "🌪️", "🔞"]

export function CoinFlipModal({ isOpen, onResult, playerCount = 2 }: CoinFlipModalProps) {
  const [isFlipping, setIsFlipping] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const { toast } = useToast()

  const performFlip = () => {
    setIsFlipping(true)
    setResult(null)

    // 3-second flip animation
    setTimeout(() => {
      const flipResult = Math.floor(Math.random() * playerCount) + 1
      setResult(flipResult)
      setIsFlipping(false)

      const emoji = PLAYER_EMOJIS[flipResult - 1] || "🎲"
      const playerNames = ["Poop Swirl", "Plunger", "Swirl Vortex", "Clog King"]
      const playerName = playerNames[flipResult - 1] || `Player ${flipResult}`

      toast({
        title: "🌪️ El Shito Coin Flip!",
        description: `Player ${flipResult} ${emoji} (${playerName}) Starts First!`,
      })

      setTimeout(() => {
        onResult(flipResult)
      }, 1000)
    }, 3000)
  }

  useEffect(() => {
    if (isOpen && !isFlipping && result === null) {
      performFlip()
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen}>
      <DialogContent className="border border-primary/50 bg-black/90 backdrop-blur">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-black neon-pink">Flip to Flush First!</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-8">
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Coin container */}
            <div
              className={`text-8xl transition-all ${isFlipping ? "animate-spin" : result ? "scale-110" : "scale-110"}`}
            >
              {result && PLAYER_EMOJIS[result - 1]}
              {!result && isFlipping && "🌪️"}
              {!result && !isFlipping && "💫"}
            </div>

            {/* Neon glow effect */}
            <div className="absolute inset-0 rounded-full border-2 border-primary/50 opacity-50 animate-pulse" />
          </div>

          {result && (
            <div className="text-center">
              <p className="text-xl font-bold text-primary mb-2">
                Player {result} {PLAYER_EMOJIS[result - 1]} Starts!
              </p>
              <p className="text-sm text-muted-foreground">
                Get ready to flush your foe{playerCount > 2 ? "s" : ""}...
              </p>
            </div>
          )}

          {isFlipping && (
            <div className="text-center">
              <p className="text-lg font-bold text-accent animate-pulse">Flipping...</p>
            </div>
          )}

          {result && !isFlipping && (
            <Button
              onClick={() => onResult(result)}
              className="mt-4 px-8 py-3 bg-primary text-black font-bold rounded hover:bg-primary/90 transition"
            >
              Continue to Game
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CoinFlipModal
