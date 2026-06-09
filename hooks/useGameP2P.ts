"use client"

import { useEffect, useRef, useState } from "react"
import { GameP2PService, type GameMove } from "@/lib/supabase/game-p2p-service"

export function useGameP2P(gameId: string, playerWallet: string) {
  const serviceRef = useRef<GameP2PService | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [opponentMove, setOpponentMove] = useState<GameMove | null>(null)

  useEffect(() => {
    if (!gameId || !playerWallet) return

    serviceRef.current = new GameP2PService(gameId, playerWallet)

    serviceRef.current.joinGame((move: GameMove) => {
      setSyncing(true)
      setOpponentMove(move)
      setTimeout(() => setSyncing(false), 300)
    })

    return () => {
      serviceRef.current?.leaveGame()
    }
  }, [gameId, playerWallet])

  const sendMove = async (index: number, player: "X" | "O") => {
    if (!serviceRef.current) return

    setSyncing(true)
    try {
      await serviceRef.current.broadcastMove(index, player)
    } finally {
      setSyncing(false)
    }
  }

  return {
    syncing,
    opponentMove,
    sendMove,
  }
}
