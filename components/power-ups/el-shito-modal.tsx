"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { PowerUp } from "@/lib/power-ups/el-shito-service"

interface ElShitoModalProps {
  isOpen: boolean
  powerUp: PowerUp | null
  onClose: () => void
  onApply: () => void
  isLoading?: boolean
}

export function ElShitoModal({ isOpen, powerUp, onClose, onApply, isLoading = false }: ElShitoModalProps) {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setAnimate(true)
    } else {
      setAnimate(false)
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-2 border-cyan-400 bg-black/90 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-cyan-400 to-lime-400">
            ✨ EL SHITO STRIKES! ✨
          </DialogTitle>
        </DialogHeader>

        {powerUp && (
          <div className="space-y-6 py-6">
            {/* Animated El Shito Logo */}
            <div
              className={`flex justify-center text-6xl transition-all duration-500 ${animate ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}
            >
              💩
            </div>

            {/* Power-Up Info */}
            <div className="space-y-3 text-center">
              <h2 className="text-xl font-bold text-cyan-400 text-shadow-lg">{powerUp.name}</h2>
              <p className="text-sm text-lime-300">{powerUp.description}</p>
              <p className="text-xs text-pink-400">Cost: {powerUp.cost} $DATX</p>
            </div>

            {/* Neon Grid Background Effect */}
            <div className="relative h-32 border-2 border-pink-500/30 rounded-lg bg-gradient-to-br from-cyan-500/10 to-pink-500/10 overflow-hidden">
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-lime-400/20 to-transparent animate-pulse"
                style={{
                  animation: "shimmer 2s infinite",
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`text-4xl transition-transform duration-700 ${animate ? "rotate-360 scale-110" : ""}`}>
                  {powerUp.type === "flush_strike" && "🌪️"}
                  {powerUp.type === "bandana_blind" && "🕶️"}
                  {powerUp.type === "poop_swirl" && "🌀"}
                  {powerUp.type === "plunger_pull" && "🪯"}
                  {powerUp.type === "reserve_hole" && "🕳️"}
                  {powerUp.type === "clog_jam" && "🚫"}
                  {powerUp.type === "neon_hallucination" && "✨"}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <Button
              onClick={onApply}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-pink-500 to-cyan-400 hover:from-pink-600 hover:to-cyan-500 text-black font-bold h-12 text-lg rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
            >
              {isLoading ? "ACTIVATING..." : "ACTIVATE POWER-UP"}
            </Button>

            <button
              onClick={onClose}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Or dismiss
            </button>
          </div>
        )}

        <style jsx>{`
          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
          @keyframes rotate360 {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          .text-shadow-lg {
            text-shadow: 0 0 20px rgba(0, 255, 255, 0.8), 0 0 40px rgba(233, 30, 99, 0.6);
          }
          /* Enhanced with sexy velvet neon style: pink-brown glow, dripping sludge BG, bandana eyes, poop swirl animation */
          .velvet-neon {
            background-color: #ff69b4; /* Hot pink */
            color: #8a2be2; /* Blue violet */
            text-shadow: 0 0 10px #ff69b4, 0 0 20px #8a2be2, 0 0 30px #ff69b4, 0 0 40px #8a2be2;
          }
          .dripping-sludge {
            background-image: url('/path/to/dripping-sludge-bg.png');
            background-size: cover;
          }
          .bandana-eyes {
            background-image: url('/path/to/bandana-eyes.png');
            background-position: center;
            background-repeat: no-repeat;
          }
          .poop-swirl {
            animation: swirl 5s linear infinite;
          }
          @keyframes swirl {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  )
}
