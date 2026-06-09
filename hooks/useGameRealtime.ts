"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"
import { useToast } from "@/hooks/use-toast"

export function useGameRealtime(gameId: string | null) {
  const [gameData, setGameData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const { toast } = useToast()
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  // Fetch initial game state
  useEffect(() => {
    if (!gameId) return

    const fetchGame = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase.from("games").select("*").eq("id", gameId).single()

        if (error) throw error
        setGameData(data)
      } catch (err) {
        toast({
          title: "Sync Error",
          description: "Failed to load game state",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchGame()
  }, [gameId, toast])

  // Subscribe to realtime updates
  useEffect(() => {
    if (!gameId) return

    setSyncing(true)
    const gameChannel = supabase
      .channel(`game:${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "games",
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          setGameData(payload.new)
          setSyncing(false)
        },
      )
      .subscribe()

    setChannel(gameChannel)

    return () => {
      if (gameChannel) {
        supabase.removeChannel(gameChannel)
      }
    }
  }, [gameId])

  const updateGame = useCallback(
    async (updates: any) => {
      if (!gameId) return
      try {
        setSyncing(true)
        const { error } = await supabase.from("games").update(updates).eq("id", gameId)

        if (error) throw error
      } catch (err) {
        toast({
          title: "Update Failed",
          description: "Could not sync game state",
          variant: "destructive",
        })
      }
    },
    [gameId, toast],
  )

  return { gameData, loading, syncing, updateGame, channel }
}
