"use client"

import { useBettingStore } from "@/lib/stores/betting-store"
import { Card } from "@/components/ui/card"

export function TransactionHistory() {
  const { leaderboard } = useBettingStore()

  if (!leaderboard || leaderboard.length === 0) {
    return null
  }

  return (
    <Card className="w-full p-4 bg-card border-primary/50">
      <h3 className="text-sm font-bold text-primary mb-3">Recent Activity</h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {leaderboard.slice(0, 5).map((player) => (
          <div key={player.id} className="text-xs text-muted-foreground flex justify-between">
            <span>
              {player.address.slice(0, 6)}...{player.address.slice(-4)}
            </span>
            <span className="text-accent">{player.wins} wins</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
