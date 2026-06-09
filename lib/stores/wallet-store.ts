"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { SolanaNetwork } from "@/lib/config/solana-config"

export interface WalletState {
  // Wallet connection state
  isConnected: boolean
  publicKey: string | null

  // Balances
  solBalance: number
  datxBalance: number // Mock $DATX balance

  network: SolanaNetwork
  mode: "mock" | "real"
  mockMode: boolean // Legacy, kept for backward compatibility

  // Error state
  error: string | null

  // Hydration state
  isHydrated: boolean

  // Balance fetching state and account subscription
  isFetchingBalance: boolean
  lastBalanceUpdate: number
  accountSubscriptionId: number | null

  // Actions
  setConnected: (connected: boolean) => void
  setPublicKey: (key: string | null) => void
  setSolBalance: (balance: number) => void
  setDatxBalance: (balance: number) => void
  setNetwork: (network: SolanaNetwork) => void
  setMode: (mode: "mock" | "real") => void
  setMockMode: (mock: boolean) => void
  setError: (error: string | null) => void
  setHydrated: (hydrated: boolean) => void
  setFetchingBalance: (fetching: boolean) => void
  setLastBalanceUpdate: (time: number) => void
  setAccountSubscriptionId: (id: number | null) => void

  // Betting related
  deductBalance: (amount: number) => boolean
  addBalance: (amount: number) => void
  resetWallet: () => void
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      isConnected: false,
      publicKey: null,
      solBalance: 0,
      datxBalance: 1000, // Start with 1000 mock $DATX
      network: "devnet" as SolanaNetwork,
      mode: "mock" as const,
      mockMode: true,
      error: null,
      isHydrated: false,
      isFetchingBalance: false,
      lastBalanceUpdate: 0,
      accountSubscriptionId: null,

      setConnected: (connected) => set({ isConnected: connected }),
      setPublicKey: (key) => set({ publicKey: key }),
      setSolBalance: (balance) => set({ solBalance: balance }),
      setDatxBalance: (balance) => set({ datxBalance: balance }),
      setNetwork: (network) => set({ network }),
      setMode: (mode) => set({ mode, mockMode: mode === "mock" }),
      setMockMode: (mock) => set({ mockMode: mock, mode: mock ? "mock" : "real" }),
      setError: (error) => set({ error }),
      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
      setFetchingBalance: (fetching) => set({ isFetchingBalance: fetching }),
      setLastBalanceUpdate: (time) => set({ lastBalanceUpdate: time }),
      setAccountSubscriptionId: (id) => set({ accountSubscriptionId: id }),

      deductBalance: (amount) => {
        const { datxBalance } = get()
        if (datxBalance >= amount) {
          set({ datxBalance: datxBalance - amount })
          return true
        }
        set({ error: "Insufficient mock $DATX balance" })
        return false
      },

      addBalance: (amount) => {
        const { datxBalance } = get()
        set({ datxBalance: datxBalance + amount })
      },

      resetWallet: () =>
        set({
          isConnected: false,
          publicKey: null,
          solBalance: 0,
          error: null,
        }),
    }),
    {
      name: "sewer-arena-wallet",
      version: 1,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    },
  ),
)
