import { create } from "zustand"

interface GameStateStore {
  currentGameId: string | null
  setCurrentGameId: (id: string) => void
  coinFlipResult: number | null
  setCoinFlipResult: (player: number) => void
  resetCoinFlip: () => void
}

export const useGameStateStore = create<GameStateStore>((set) => ({
  currentGameId: null,
  setCurrentGameId: (id: string) => set({ currentGameId: id }),
  coinFlipResult: null,
  setCoinFlipResult: (player: number) => set({ coinFlipResult: player }),
  resetCoinFlip: () => set({ coinFlipResult: null }),
}))
