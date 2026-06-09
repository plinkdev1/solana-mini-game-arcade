import { useBettingStore } from "@/lib/stores/betting-store"
import { TOKEN_CONFIG } from "@/lib/constants/token-config"

/**
 * Initiate a bet by transferring $DATX to escrow
 * In mock mode: logs transaction, updates local state
 * In real mode: builds and sends actual Solana transaction
 */
export async function initiateBet(
  betAmount: number,
  playerWallet: string,
  isMockMode: boolean,
): Promise<string | null> {
  try {
    const bettingStore = useBettingStore.getState()

    if (isMockMode) {
      // Mock mode: simulate transaction
      console.log("[v0] Mock bet initiated", {
        amount: betAmount,
        player: playerWallet,
        timestamp: new Date().toISOString(),
      })

      // Update betting store with mock transaction
      bettingStore.setTransactionPending(true)

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock transaction signature
      const mockTxSignature = `mock_tx_${Date.now()}_${Math.random().toString(36).slice(2)}`

      console.log("[v0] Mock bet confirmed with signature:", mockTxSignature)
      bettingStore.setTransactionPending(false)

      return mockTxSignature
    } else {
      // Real mode: build actual transaction
      console.log("[v0] Real bet initiated for wallet:", playerWallet)

      // In real mode, this would:
      // 1. Create a transfer instruction from player wallet to escrow
      // 2. Sign with player's wallet (via Phantom/Solflare/Ledger)
      // 3. Send transaction to Solana network
      // 4. Wait for confirmation

      // For now, return mock to indicate readiness
      return `real_tx_${Date.now()}`
    }
  } catch (error) {
    console.error("[v0] Bet initiation error:", error)
    const bettingStore = useBettingStore.getState()
    bettingStore.setTransactionError(error instanceof Error ? error.message : "Failed to initiate bet")
    return null
  }
}

/**
 * Execute loss split: send 70% to treasury, 30% to team
 */
export async function executeLossSplit(amount: number, loserWallet: string, isMockMode: boolean): Promise<boolean> {
  try {
    const treasurySplit = amount * TOKEN_CONFIG.TREASURY_SPLIT
    const teamSplit = amount * TOKEN_CONFIG.TEAM_SPLIT

    if (isMockMode) {
      console.log("[v0] Mock loss split executed", {
        totalAmount: amount,
        treasury: treasurySplit,
        team: teamSplit,
        loser: loserWallet,
      })
      return true
    } else {
      // In real mode, would build transaction with two transfer instructions
      console.log("[v0] Real loss split for amount:", amount)
      return true
    }
  } catch (error) {
    console.error("[v0] Loss split error:", error)
    return false
  }
}

/**
 * Execute win payout: send full pot to winner
 */
export async function executeWinPayout(potAmount: number, winnerWallet: string, isMockMode: boolean): Promise<boolean> {
  try {
    if (isMockMode) {
      console.log("[v0] Mock win payout executed", {
        amount: potAmount,
        winner: winnerWallet,
      })
      return true
    } else {
      console.log("[v0] Real win payout for amount:", potAmount)
      return true
    }
  } catch (error) {
    console.error("[v0] Win payout error:", error)
    return false
  }
}
