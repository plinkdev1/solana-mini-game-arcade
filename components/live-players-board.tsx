"use client"

import { useState, useEffect } from "react"
import { PlayerPresenceService, type OnlinePlayer } from "@/lib/supabase/player-presence-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface LivePlayersBoardProps {
  gameId: string
  matchId?: string
  playerWallet: string
}

export function LivePlayersBoard({ gameId, matchId, playerWallet }: LivePlayersBoardProps) {
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([])
  const [presenceService, setPresenceService] = useState<PlayerPresenceService | null>(null)

  useEffect(() => {
    const service = new PlayerPresenceService(gameId, playerWallet)
    setPresenceService(service)

    // Poll for presence updates every 500ms
    const interval = setInterval(() => {
      const players = service.getOnlinePlayers()
      setOnlinePlayers(players)
    }, 500)

    return () => clearInterval(interval)
  }, [gameId, playerWallet])

  if (onlinePlayers.length === 0) {
    return null
  }

  return (
    <Card className="border-pink-500/30 bg-black/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          Live Players ({onlinePlayers.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {onlinePlayers.map((player, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 bg-black/30 rounded border border-pink-500/20 hover:border-pink-500/50 transition"
            >
              <div className="flex flex-col gap-1">
                <span className="text-xs font-mono text-pink-400">{player.wallet?.slice(0, 8)}...</span>
                {player.username && <span className="text-xs text-gray-400">{player.username}</span>}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-xs">
                  <span className="text-green-400">W: {player.wins || 0}</span>
                  <span className="text-gray-500 mx-1">|</span>
                  <span className="text-red-400">L: {player.losses || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
