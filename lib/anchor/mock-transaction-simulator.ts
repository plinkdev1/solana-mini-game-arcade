"use client"

import { useWalletStore } from "@/lib/stores/wallet-store"
import { useToast } from "@/hooks/use-toast"

export interface MockTransactionResult {
  signature: string
  success: boolean
  timestamp: number
}

export function useMockTransactionSimulator() {
  const { deductBalance, addBalance } = useWalletStore()
  const { toast } = useToast()

  const simulateEscrowCreate = async (betAmount: number): Promise<MockTransactionResult> => {
    console.log(`[v0] Mock: Creating escrow with bet ${betAmount} $DATX`)
    await new Promise((resolve) => setTimeout(resolve, 500))
    return {
      signature: `mock_create_${Date.now()}`,
      success: true,
      timestamp: Date.now(),
    }
  }

  const simulateDeposit = async (betAmount: number): Promise<MockTransactionResult> => {
    console.log(`[v0] Mock: Depositing ${betAmount} $DATX to escrow`)
    const success = deductBalance(betAmount)
    if (!success) {
      return {
        signature: "",
        success: false,
        timestamp: Date.now(),
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
    return {
      signature: `mock_deposit_${Date.now()}`,
      success: true,
      timestamp: Date.now(),
    }
  }

  const simulateSettle = async (winner: boolean, betAmount: number, rake = 0.1): Promise<MockTransactionResult> => {
    const winAmount = betAmount * (1 - rake)
    console.log(`[v0] Mock: Settling game - Winner: ${winner}, Payout: ${winAmount} $DATX`)
    if (winner) {
      addBalance(winAmount)
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
    return {
      signature: `mock_settle_${Date.now()}`,
      success: true,
      timestamp: Date.now(),
    }
  }

  return { simulateEscrowCreate, simulateDeposit, simulateSettle }
}
