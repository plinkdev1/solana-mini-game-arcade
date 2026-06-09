"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"

interface Match {
  id: string
  game_type: string
  bet_amount: number
  player1_wallet: string
  created_at: string
  high_roller: boolean
}

interface MatchmakingBoardProps {
  highRollerMode?: boolean
}

export default function MatchmakingBoard({ highRollerMode = false }: MatchmakingBoardProps) {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchMatches = async () => {
      const query = supabase
        .from("matches")
        .select("*")
        .eq("status", "open")
        .eq("high_roller", highRollerMode)
        .order("created_at", { ascending: false })

      const { data, error } = await query

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load open games",
          variant: "destructive",
        })
      } else {
        setMatches(data || [])
      }
      setLoading(false)
    }

    fetchMatches()

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`matches_updates_${highRollerMode ? "high_roller" : "normal"}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
          filter: `status=eq.open&high_roller=eq.${highRollerMode}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setMatches((prev) => [payload.new, ...prev])
          } else if (payload.eventType === "DELETE") {
            setMatches((prev) => prev.filter((m) => m.id !== payload.old.id))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [toast, highRollerMode])

  const handleJoin = async (matchId: string) => {
    toast({
      title: "Joining Match",
      description: "Setting up your game...",
    })
  }

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading open games...</div>
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-12 border border-cyan-500/30 rounded-lg bg-cyan-500/5">
        <p className="text-muted-foreground mb-4">No open games right now.</p>
        <p className="text-sm text-accent">Try joining the random queue!</p>
      </div>
    )
  }

  return (
    <div className="border border-cyan-500/30 rounded-lg overflow-hidden bg-background/50">
      <Table>
        <TableHeader>
          <TableRow className="border-cyan-500/20 hover:bg-transparent">
            <TableHead className="text-cyan-400">Game</TableHead>
            <TableHead className="text-cyan-400">Bet Size</TableHead>
            <TableHead className="text-cyan-400">Host Wallet</TableHead>
            <TableHead className="text-cyan-400 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matches.map((match) => (
            <TableRow key={match.id} className="border-cyan-500/10 hover:bg-cyan-500/5">
              <TableCell className="font-bold text-green-400">{match.game_type}</TableCell>
              <TableCell>💰 {match.bet_amount.toFixed(2)} $DATX</TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {match.player1_wallet.slice(0, 6)}...{match.player1_wallet.slice(-4)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  onClick={() => handleJoin(match.id)}
                  className="bg-green-600 hover:bg-green-700 text-black font-bold text-sm"
                  size="sm"
                >
                  Join ⚔️
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
