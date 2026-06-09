import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Match {
  id: string
  gameType: string
  betAmount: number
  player1Wallet: string
  player2Wallet?: string
  status: "open" | "matched" | "started" | "completed"
  createdAt: string
  matchedAt?: string
  highRoller?: boolean
}

export interface MatchesState {
  // Queue state
  isSearching: boolean
  currentMatch: Match | null
  openMatches: Match[]

  // Filter state
  selectedBetAmount: number
  selectedGameType: string | null
  highRollerMode: boolean

  // Rate limit state - Added rate limiting tracking
  gameCount: number
  lastGameReset: number

  // Actions
  setSearching: (searching: boolean) => void
  setCurrentMatch: (match: Match | null) => void
  setOpenMatches: (matches: Match[]) => void
  setBetAmount: (amount: number) => void
  setGameType: (gameType: string | null) => void
  setHighRollerMode: (enabled: boolean) => void

  incrementGameCount: () => void
  resetGameCountIfNeeded: () => boolean
  canPlayGame: () => boolean
  getGamesRemaining: () => number

  // Queue actions
  joinQueue: (gameType: string, betAmount: number, playerWallet: string) => void
  cancelQueue: () => void
  joinMatch: (matchId: string, playerWallet: string) => void
}

export const useMatchesStore = create<MatchesState>()(
  persist(
    (set, get) => ({
      isSearching: false,
      currentMatch: null,
      openMatches: [],
      selectedBetAmount: 0.01,
      selectedGameType: null,
      highRollerMode: false,
      gameCount: 0,
      lastGameReset: Date.now(),

      setSearching: (searching) => set({ isSearching: searching }),
      setCurrentMatch: (match) => set({ currentMatch: match }),
      setOpenMatches: (matches) => set({ openMatches: matches }),
      setBetAmount: (amount) => set({ selectedBetAmount: amount }),
      setGameType: (gameType) => set({ selectedGameType: gameType }),
      setHighRollerMode: (enabled) => set({ highRollerMode: enabled }),

      incrementGameCount: () => {
        const { lastGameReset, gameCount } = get()
        const now = Date.now()
        const hourPassed = now - lastGameReset > 3600000

        if (hourPassed) {
          set({ gameCount: 1, lastGameReset: now })
        } else {
          set({ gameCount: gameCount + 1 })
        }
      },

      resetGameCountIfNeeded: () => {
        const { lastGameReset } = get()
        const now = Date.now()
        const hourPassed = now - lastGameReset > 3600000

        if (hourPassed) {
          set({ gameCount: 0, lastGameReset: now })
          return true
        }
        return false
      },

      canPlayGame: () => {
        const { gameCount } = get()
        get().resetGameCountIfNeeded()
        return gameCount < 5
      },

      getGamesRemaining: () => {
        const { gameCount } = get()
        get().resetGameCountIfNeeded()
        return Math.max(0, 5 - gameCount)
      },

      joinQueue: (gameType, betAmount, playerWallet) => {
        set({
          isSearching: true,
          selectedGameType: gameType,
          selectedBetAmount: betAmount,
        })
      },

      cancelQueue: () => set({ isSearching: false }),

      joinMatch: (matchId, playerWallet) => {
        set({ isSearching: false })
      },
    }),
    {
      name: "sewer-arena-matches",
      version: 1,
    },
  ),
)
