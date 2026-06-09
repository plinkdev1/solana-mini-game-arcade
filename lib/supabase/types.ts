export interface User {
  id: string
  wallet_address: string
  username?: string
  email?: string
  created_at: string
  last_login?: string
  total_wins: number
  total_losses: number
  datx_balance_mock: number
}

export interface Game {
  id: string
  game_type: string
  player1_id: string
  player2_id: string
  status: "pending" | "playing" | "completed"
  winner_id?: string
  bet_amount: number
  started_at: string
  ended_at?: string
  moves: Record<string, unknown>[]
}

export interface Bet {
  id: string
  game_id: string
  player_id: string
  amount: number
  status: "pending" | "settled" | "cancelled"
  tx_signature?: string
  rake_treasury: number
  rake_team: number
  created_at: string
}

export interface Leaderboard {
  id: string
  user_id: string
  wins: number
  losses: number
  total_bet_won: number
  total_bet_lost: number
  rank: number
  updated_at: string
}

export interface TreasuryLog {
  id: string
  bet_id?: string
  treasury_amount: number
  team_amount: number
  tx_signature?: string
  created_at: string
}

export interface GameHistory {
  id: string
  user_id: string
  game_id: string
  game_type: string
  opponent_id?: string
  bet_amount: number
  result: "win" | "loss" | "draw"
  rake_paid: number
  created_at: string
}
