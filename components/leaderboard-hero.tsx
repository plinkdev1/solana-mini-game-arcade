"use client"

import { Trophy } from "lucide-react"

export function LeaderboardHero() {
  return (
    <div className="relative text-center py-12 px-6 mb-8">
      <div className="flex items-center justify-center gap-3 mb-4">
        <Trophy className="w-8 h-8 text-primary animate-pulse" />
        <h1 className="text-5xl font-black text-primary neon-pink">Shittiest Strategists – Top Flushers</h1>
        <Trophy className="w-8 h-8 text-primary animate-pulse" />
      </div>
      <p className="text-accent text-lg max-w-2xl mx-auto mb-2">
        Global elite who've dominated the Sewer Arena – where every flush counts
      </p>
      <p className="text-sm text-cyan-400 max-w-2xl mx-auto">
        🏆 Monthly Rewards Flush – Earn $DATX Airdrops + Exclusive NFTs. Funded by game rake (7% treasury)
      </p>
    </div>
  )
}
