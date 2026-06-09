import { supabase } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

export interface GameMove {
  index: number
  player: "X" | "O"
  timestamp: string
  wallet: string
}

export class GameP2PService {
  private channel: RealtimeChannel | null = null
  private gameId: string
  private playerWallet: string

  constructor(gameId: string, playerWallet: string) {
    this.gameId = gameId
    this.playerWallet = playerWallet
  }

  joinGame(callback: (move: GameMove) => void) {
    this.channel = supabase
      .channel(`game:${this.gameId}`)
      .on("presence", { event: "sync" }, () => {
        const state = this.channel?.presenceState()
        console.log("[v0] Players online:", state)
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("[v0] Player joined:", key)
      })
      .on("broadcast", { event: "move" }, ({ payload }) => {
        callback(payload)
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await this.channel?.track({
            wallet: this.playerWallet,
            online_at: new Date().toISOString(),
          })
        }
      })
  }

  async broadcastMove(index: number, player: "X" | "O") {
    if (!this.channel) return

    const move: GameMove = {
      index,
      player,
      timestamp: new Date().toISOString(),
      wallet: this.playerWallet,
    }

    await this.channel.send({
      type: "broadcast",
      event: "move",
      payload: move,
    })
  }

  leaveGame() {
    if (this.channel) {
      supabase.removeChannel(this.channel)
      this.channel = null
    }
  }

  getPresence() {
    return this.channel?.presenceState() || {}
  }
}
