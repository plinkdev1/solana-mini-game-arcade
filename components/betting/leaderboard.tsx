"use client"

import { useBettingStore } from "@/lib/stores/betting-store"
import { Card } from "@/components/ui/card"

export function Leaderboard() {
  const { leaderboard } = useBettingStore()

  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.wins - a.wins).slice(0, 10)

  return (
    <Card className="p-4 bg-card border-primary/50">
      <h3 className="text-lg font-bold text-primary mb-4">Leaderboard</h3>

      {sortedLeaderboard.length === 0 ? (
        <div className="text-center text-muted-foreground py-4">No rankings yet. Start betting!</div>
      ) : (
        <div className="space-y-2">
          {sortedLeaderboard.map((player, idx) => (
            <div key={player.address} className="flex items-center justify-between text-sm border-b border-border pb-2">
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground font-bold w-6">#{idx + 1}</span>
                <span className="text-accent">{player.address.slice(0, 8)}...</span>
              </div>
              <div className="flex gap-4 text-xs">
                <div>
                  <span className="text-green-500">{player.wins}W</span>
                  <span className="text-destructive"> {player.losses}L</span>
                </div>
                <div className="text-muted-foreground">${player.totalEarnings.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
