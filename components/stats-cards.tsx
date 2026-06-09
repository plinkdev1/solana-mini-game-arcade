"use client"

import { useBettingStore } from "@/lib/stores/betting-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

export function StatsCards() {
  const { mockBalance, getGameStats, gameHistory } = useBettingStore()
  const stats = getGameStats()

  const pieData = [
    { name: "Wins", value: stats.wins, color: "hsl(142, 76%, 36%)" },
    { name: "Losses", value: stats.losses, color: "hsl(0, 84%, 60%)" },
    { name: "Draws", value: stats.draws, color: "hsl(217, 91%, 60%)" },
  ]

  const balanceData = [
    { name: "Won", value: stats.totalWon, fill: "hsl(142, 76%, 36%)" },
    { name: "Lost", value: stats.totalLost, fill: "hsl(0, 84%, 60%)" },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Wins/Losses Pie Chart */}
      <Card className="bg-card/50 border border-pink-500/30 hover:border-pink-500/60 transition-colors">
        <CardHeader>
          <CardTitle className="text-pink-400">Win/Loss Record</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center">
            {stats.totalGames > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm">No games yet</p>
            )}
          </div>
          <div className="mt-4 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-green-400">{stats.wins}W</span>
              <span className="text-red-400">{stats.losses}L</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* $DATX Balance */}
      <Card className="bg-card/50 border border-purple-500/30 hover:border-purple-500/60 transition-colors">
        <CardHeader>
          <CardTitle className="text-purple-400">Mock Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary mb-2">${mockBalance.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Current $DATX Balance</p>
          <div className="mt-4 h-2 bg-background rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 w-3/4" />
          </div>
        </CardContent>
      </Card>

      {/* Win Rate */}
      <Card className="bg-card/50 border border-blue-500/30 hover:border-blue-500/60 transition-colors">
        <CardHeader>
          <CardTitle className="text-blue-400">Win Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary mb-2">{stats.winRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">{stats.totalGames} games played</p>
          <div className="mt-4 h-2 bg-background rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
              style={{ width: `${Math.min(stats.winRate, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Recent Games Summary */}
      <Card className="bg-card/50 border border-amber-500/30 hover:border-amber-500/60 transition-colors">
        <CardHeader>
          <CardTitle className="text-amber-400">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Last 10 Games:</span>
              <span className="text-amber-400 font-semibold">
                {gameHistory.slice(0, 10).filter((g) => g.result === "win").length}W
              </span>
            </div>
            <div className="h-8 bg-background rounded flex gap-1 overflow-hidden">
              {gameHistory.slice(0, 10).map((game, idx) => (
                <div
                  key={idx}
                  className={`flex-1 ${
                    game.result === "win" ? "bg-green-500" : game.result === "loss" ? "bg-red-500" : "bg-blue-500"
                  } opacity-75 hover:opacity-100 transition-opacity`}
                  title={`${game.gameType}: ${game.result}`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
