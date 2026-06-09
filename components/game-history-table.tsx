"use client"

import { useBettingStore } from "@/lib/stores/betting-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function GameHistoryTable() {
  const { getRecentGames } = useBettingStore()
  const recentGames = getRecentGames(20)

  return (
    <Card className="bg-card/50 border border-primary/30">
      <CardHeader>
        <CardTitle>Game History</CardTitle>
      </CardHeader>
      <CardContent>
        {recentGames.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No games played yet. Start betting!</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-primary">Game</TableHead>
                <TableHead className="text-primary">Bet</TableHead>
                <TableHead className="text-primary">Result</TableHead>
                <TableHead className="text-primary">Rake</TableHead>
                <TableHead className="text-primary">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentGames.map((game, idx) => (
                <TableRow key={game.id} className="border-border/30 hover:bg-primary/5">
                  <TableCell className="text-muted-foreground">{game.gameType}</TableCell>
                  <TableCell className="text-accent">${game.betAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        game.result === "win"
                          ? "bg-green-500/20 text-green-400"
                          : game.result === "loss"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      {game.result.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="text-destructive">${game.rake.toFixed(4)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(game.timestamp).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
