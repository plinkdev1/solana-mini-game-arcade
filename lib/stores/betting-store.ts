import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useWalletStore } from "./wallet-store"

export interface GameHistory {
  id: string
  gameType: string
  betAmount: number
  result: "win" | "loss" | "draw" | "pending"
  timestamp: number
  opponent?: string
  rake: number
  room?: "normal" | "high_roller"
  rakeBreakdown?: {
    treasury: number
    team: number
  }
}

export interface BettingState {
  // Wallet state
  walletAddress: string | null
  isWalletConnected: boolean

  // Mock balances (localStorage persisted)
  mockBalance: number // Player's mock $DATX balance
  treasuryBalance: number // 70% split destination
  teamBalance: number // 30% split destination

  // Current bet state
  currentBet: number // Amount being bet (0.01 - 0.1)
  escrowPlayer1Stake: number
  escrowPlayer2Stake: number
  gameInProgress: boolean

  // Transaction state
  transactionStatus: "idle" | "pending" | "success" | "error"
  transactionError: string | null

  // Leaderboard
  leaderboard: Array<{
    id: string
    address: string
    wins: number
    losses: number
    totalEarnings: number
    totalBurned: number
  }>

  // Game history tracking
  gameHistory: GameHistory[]
  addGameToHistory: (game: GameHistory) => void
  getRecentGames: (limit: number) => GameHistory[]
  getGameStats: () => {
    totalGames: number
    wins: number
    losses: number
    draws: number
    totalWon: number
    totalLost: number
    winRate: number
  }

  // Hydration state
  isHydrated: boolean
  setHydrated: (hydrated: boolean) => void

  // Actions
  setWalletAddress: (address: string | null) => void
  setIsWalletConnected: (connected: boolean) => void
  setBet: (amount: number) => void
  initializeEscrow: (player1Stake: number, player2Stake: number) => void
  setGameInProgress: (inProgress: boolean) => void

  // Transaction actions
  setTransactionPending: (pending: boolean) => void
  setTransactionError: (error: string | null) => void

  // Game outcomes
  playerWins: (isPlayer1: boolean, potAmount: number) => void
  playerLoses: (loserAddress: string) => void

  // Leaderboard management
  updateLeaderboard: (stats: BettingState["leaderboard"][0]) => void
  getPlayerStats: (address: string) => BettingState["leaderboard"][0] | undefined

  // Rake calculation helper function
  calculateRake: (totalPot: number) => {
    winnerAmount: number
    treasuryRake: number
    teamRake: number
  }

  // Bet range getters based on room type
  getBetRange: (roomType: "normal" | "high_roller") => {
    min: number
    max: number
  }

  // Bet validation function
  validateBetAmount: (betAmount: number, roomType: "normal" | "high_roller") => boolean
}

const BET_CONFIG = {
  NORMAL_ROOM: { MIN_BET: 0.01, MAX_BET: 0.1 },
  HIGH_ROLLER_ROOM: { MIN_BET: 0.5, MAX_BET: 1 },
}

const validateBetAmount = (betAmount: number, roomType: "normal" | "high_roller"): boolean => {
  const config = roomType === "normal" ? BET_CONFIG.NORMAL_ROOM : BET_CONFIG.HIGH_ROLLER_ROOM
  return betAmount >= config.MIN_BET && betAmount <= config.MAX_BET
}

export const useBettingStore = create<BettingState>()(
  persist(
    (set, get) => ({
      walletAddress: null,
      isWalletConnected: false,
      mockBalance: 1000, // Start with 1000 mock $DATX
      treasuryBalance: 0,
      teamBalance: 0,
      currentBet: 0.01,
      escrowPlayer1Stake: 0,
      escrowPlayer2Stake: 0,
      gameInProgress: false,
      transactionStatus: "idle",
      transactionError: null,
      leaderboard: [],
      gameHistory: [],
      isHydrated: false,

      setWalletAddress: (address) => set({ walletAddress: address }),
      setIsWalletConnected: (connected) => set({ isWalletConnected: connected }),
      setHydrated: (hydrated) => set({ isHydrated: hydrated }),

      setBet: (amount) => {
        const { mockBalance } = get()
        if (amount > mockBalance) {
          console.error("Insufficient mock balance")
          return
        }
        set({ currentBet: amount })
      },

      initializeEscrow: (player1Stake, player2Stake) => {
        set({
          escrowPlayer1Stake: player1Stake,
          escrowPlayer2Stake: player2Stake,
          gameInProgress: true,
        })
      },

      setGameInProgress: (inProgress) => set({ gameInProgress: inProgress }),

      setTransactionPending: (pending) =>
        set({
          transactionStatus: pending ? "pending" : "idle",
          transactionError: null,
        }),

      setTransactionError: (error) =>
        set({
          transactionStatus: error ? "error" : "idle",
          transactionError: error,
        }),

      // Rake calculation function - 90% to winner, 7% treasury, 3% team
      calculateRake: (totalPot: number) => {
        const treasuryRake = totalPot * 0.07
        const teamRake = totalPot * 0.03
        const winnerAmount = totalPot * 0.9
        return { winnerAmount, treasuryRake, teamRake }
      },

      playerWins: (isPlayer1, potAmount) => {
        const { mockBalance, calculateRake } = get()
        const walletState = useWalletStore.getState()

        const { winnerAmount, treasuryRake, teamRake } = calculateRake(potAmount)

        if (walletState.mockMode) {
          set({
            mockBalance: mockBalance + winnerAmount,
            treasuryBalance: get().treasuryBalance + treasuryRake,
            teamBalance: get().teamBalance + teamRake,
            escrowPlayer1Stake: 0,
            escrowPlayer2Stake: 0,
            gameInProgress: false,
          })
        } else {
          walletState.addBalance(winnerAmount)
          set({
            treasuryBalance: get().treasuryBalance + treasuryRake,
            teamBalance: get().teamBalance + teamRake,
            escrowPlayer1Stake: 0,
            escrowPlayer2Stake: 0,
            gameInProgress: false,
          })
        }

        const gameType = isPlayer1 ? "Player 1 vs Player 2" : "Player 2 vs Player 1"
        const opponent = isPlayer1 ? "Player 2" : "Player 1"
        const game: GameHistory = {
          id: Date.now().toString(),
          gameType,
          betAmount: get().currentBet,
          result: "win",
          timestamp: Date.now(),
          opponent,
          rake: treasuryRake + teamRake,
          room: "normal", // Default room type
          rakeBreakdown: { treasury: treasuryRake, team: teamRake },
        }
        get().addGameToHistory(game)
      },

      playerLoses: (loserAddress) => {
        const { mockBalance, escrowPlayer1Stake, escrowPlayer2Stake, treasuryBalance, teamBalance, calculateRake } =
          get()
        const totalPot = escrowPlayer1Stake + escrowPlayer2Stake

        const { winnerAmount, treasuryRake, teamRake } = calculateRake(totalPot)
        const walletState = useWalletStore.getState()

        if (walletState.mockMode) {
          set({
            // Note: loser's balance already deducted during bet, so no additional deduction needed
            treasuryBalance: treasuryBalance + treasuryRake,
            teamBalance: teamBalance + teamRake,
            escrowPlayer1Stake: 0,
            escrowPlayer2Stake: 0,
            gameInProgress: false,
          })
        } else {
          set({
            treasuryBalance: treasuryBalance + treasuryRake,
            teamBalance: teamBalance + teamRake,
            escrowPlayer1Stake: 0,
            escrowPlayer2Stake: 0,
            gameInProgress: false,
          })
        }

        const gameType = "Player 1 vs Player 2"
        const game: GameHistory = {
          id: Date.now().toString(),
          gameType,
          betAmount: get().currentBet,
          result: "loss",
          timestamp: Date.now(),
          opponent: loserAddress,
          rake: treasuryRake + teamRake,
          room: "normal", // Default room type
          rakeBreakdown: { treasury: treasuryRake, team: teamRake },
        }
        get().addGameToHistory(game)
      },

      updateLeaderboard: (stats) => {
        const { leaderboard } = get()
        const existingIndex = leaderboard.findIndex((s) => s.address === stats.address)

        if (existingIndex !== -1) {
          leaderboard[existingIndex] = stats
        } else {
          leaderboard.push(stats)
        }

        set({ leaderboard })
      },

      getPlayerStats: (address) => {
        const { leaderboard } = get()
        return leaderboard.find((s) => s.address === address)
      },

      // Game history management
      addGameToHistory: (game: GameHistory) => {
        const { gameHistory } = get()

        // Log to console for audit trail (mock - would log to Supabase in production)
        console.log("[v0] Bet logged to audit trail:", {
          gameId: game.id,
          gameType: game.gameType,
          betAmount: game.betAmount,
          room: game.room,
          rake: game.rake,
          rakeBreakdown: game.rakeBreakdown,
          timestamp: new Date(game.timestamp).toISOString(),
        })

        set({ gameHistory: [game, ...gameHistory].slice(0, 100) })
      },

      getRecentGames: (limit = 10) => {
        const { gameHistory } = get()
        return gameHistory.slice(0, limit)
      },

      getGameStats: () => {
        const { gameHistory } = get()
        const totalGames = gameHistory.length
        const wins = gameHistory.filter((g) => g.result === "win").length
        const losses = gameHistory.filter((g) => g.result === "loss").length
        const draws = gameHistory.filter((g) => g.result === "draw").length
        const totalWon = gameHistory.filter((g) => g.result === "win").reduce((sum, g) => sum + g.betAmount, 0)
        const totalLost = gameHistory.filter((g) => g.result === "loss").reduce((sum, g) => sum + g.betAmount, 0)
        const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0

        return {
          totalGames,
          wins,
          losses,
          draws,
          totalWon,
          totalLost,
          winRate,
        }
      },

      // Bet range getters based on room type
      getBetRange: (roomType) => {
        const config = roomType === "normal" ? BET_CONFIG.NORMAL_ROOM : BET_CONFIG.HIGH_ROLLER_ROOM
        return { min: config.MIN_BET, max: config.MAX_BET }
      },

      // Bet validation function
      validateBetAmount: (betAmount, roomType) => validateBetAmount(betAmount, roomType),
    }),
    {
      name: "sewer-arena-betting",
      version: 1,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    },
  ),
)
