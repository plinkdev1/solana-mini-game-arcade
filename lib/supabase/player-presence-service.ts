import { GameP2PService } from "@/lib/supabase/game-p2p-service"

export interface OnlinePlayer {
  wallet: string
  online_at: string
  username?: string
  wins?: number
  losses?: number
}

export class PlayerPresenceService {
  private gameP2PService: GameP2PService

  constructor(gameId: string, playerWallet: string) {
    this.gameP2PService = new GameP2PService(gameId, playerWallet)
  }

  getOnlinePlayers(): OnlinePlayer[] {
    const presence = this.gameP2PService.getPresence()
    const players: OnlinePlayer[] = []

    for (const [key, value] of Object.entries(presence)) {
      const presences = Array.isArray(value) ? value : [value]
      presences.forEach((p: any) => {
        if (p.wallet) {
          players.push({
            wallet: p.wallet,
            online_at: p.online_at || new Date().toISOString(),
            username: p.username,
            wins: p.wins || 0,
            losses: p.losses || 0,
          })
        }
      })
    }

    return players
  }

  getPlayerCount(): number {
    return this.getOnlinePlayers().length
  }

  async updatePlayerProfile(username: string, wins: number, losses: number) {
    const presence = this.gameP2PService.getPresence()
    // Update local presence data with profile info for broadcast
    return { username, wins, losses }
  }
}
