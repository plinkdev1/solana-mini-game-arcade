"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function GamesHero() {
  return (
    <section className="relative py-20 px-6 text-center overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-900/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative max-w-4xl mx-auto">
        <div className="mb-2 text-sm font-bold text-accent uppercase tracking-widest animate-bounce">
          ⚡ El Shito Awaits ⚡
        </div>

        {/* Flickering neon title with pink-brown glow */}
        <h1
          className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-pink-500 mb-4 animate-pulse"
          style={{ textShadow: "0 0 30px rgba(233, 30, 99, 0.8), 0 0 60px rgba(217, 119, 6, 0.6)" }}
        >
          Sewer Arena Games
        </h1>

        <h2
          className="text-3xl md:text-4xl font-bold text-accent mb-2 animate-pulse"
          style={{ textShadow: "0 0 20px rgba(0, 255, 65, 0.8)" }}
        >
          Flush Your Foes
        </h2>

        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Twenty games. One Reserve Hole. Bet $DATX, trigger El Shito power-ups, and watch chaos unfold.
          <span className="text-accent font-bold"> Climb leaderboards. Burn enemies to the treasury.</span>
        </p>

        <div className="flex flex-col md:flex-row justify-center gap-4 mb-8">
          <Link href="/#wallet">
            <Button
              className="bg-gradient-to-r from-pink-500 to-amber-600 hover:from-pink-600 hover:to-amber-700 text-black font-bold px-8 py-6 text-lg"
              style={{ boxShadow: "0 0 20px rgba(233, 30, 99, 0.5)" }}
            >
              Connect Wallet
            </Button>
          </Link>
          <Link href="/#leaderboard">
            <Button
              variant="outline"
              className="border-2 border-accent text-accent hover:bg-accent/20 bg-transparent font-bold px-8 py-6 text-lg"
              style={{ boxShadow: "0 0 15px rgba(0, 255, 65, 0.3)" }}
            >
              View Leaderboard
            </Button>
          </Link>
        </div>

        {/* Dripping sludge effect animation */}
        <div className="text-center text-2xl animate-bounce" style={{ animationDuration: "3s" }}>
          💩 💧 💩 💧 💩
        </div>
      </div>
    </section>
  )
}
