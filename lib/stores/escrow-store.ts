"use client"

import { create } from "zustand"
import type { PublicKey } from "@solana/web3.js"

export interface EscrowState {
  // Escrow transaction state
  escrowPda: PublicKey | null
  depositTxSignature: string | null
  settleTxSignature: string | null

  // Transaction progress
  txStatus: "idle" | "creating" | "depositing_p1" | "depositing_p2" | "settling" | "success" | "error"
  txError: string | null

  // Mock mode
  mockMode: boolean

  // Actions
  setEscrowPda: (pda: PublicKey | null) => void
  setDepositTxSignature: (sig: string | null) => void
  setSettleTxSignature: (sig: string | null) => void
  setTxStatus: (status: EscrowState["txStatus"]) => void
  setTxError: (error: string | null) => void
  setMockMode: (mock: boolean) => void
  reset: () => void
}

export const useEscrowStore = create<EscrowState>((set) => ({
  escrowPda: null,
  depositTxSignature: null,
  settleTxSignature: null,
  txStatus: "idle",
  txError: null,
  mockMode: true,

  setEscrowPda: (pda) => set({ escrowPda: pda }),
  setDepositTxSignature: (sig) => set({ depositTxSignature: sig }),
  setSettleTxSignature: (sig) => set({ settleTxSignature: sig }),
  setTxStatus: (status) => set({ txStatus: status }),
  setTxError: (error) => set({ txError: error }),
  setMockMode: (mock) => set({ mockMode: mock }),
  reset: () =>
    set({
      escrowPda: null,
      depositTxSignature: null,
      settleTxSignature: null,
      txStatus: "idle",
      txError: null,
    }),
}))
