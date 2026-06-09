/**
 * Global bet configuration for Sewer Arena
 * Accounts for DATX memecoin economics (high supply, low price)
 * Rake: 10% total (7% treasury, 3% team) - scales with bet size
 */

export const BET_CONFIG = {
  NORMAL_ROOM: {
    MIN_BET: 1, // Minimum to avoid dust (exceeds ~0.001 USD equiv in Sol tx fees)
    MAX_BET: 1000, // Casual play limit
    DESCRIPTION: "1 - 1000 $DATX",
  },
  HIGH_ROLLER_ROOM: {
    MIN_BET: 1000, // High roller entry threshold
    MAX_BET: Number.POSITIVE_INFINITY, // No hard max
    SOFT_CAP: 100000, // UI warning threshold
    WARNING_MESSAGE: "High bets may incur higher fees – confirm?",
    DESCRIPTION: "1000+ $DATX",
  },
  RAKE: {
    TOTAL_PERCENT: 0.1, // 10%
    TREASURY_PERCENT: 0.07, // 7%
    TEAM_PERCENT: 0.03, // 3%
  },
}

/**
 * Validate bet amount for a given room type
 */
export function validateBetAmount(
  betAmount: number,
  roomType: "normal" | "high_roller",
): {
  isValid: boolean
  error?: string
} {
  const config = roomType === "normal" ? BET_CONFIG.NORMAL_ROOM : BET_CONFIG.HIGH_ROLLER_ROOM

  if (betAmount < config.MIN_BET) {
    return {
      isValid: false,
      error: `Minimum bet for ${roomType} room is ${config.MIN_BET} $DATX`,
    }
  }

  if (betAmount > config.MAX_BET) {
    return {
      isValid: false,
      error: `Maximum bet for ${roomType} room is ${config.MAX_BET} $DATX`,
    }
  }

  return { isValid: true }
}

/**
 * Check if bet should trigger high roller warning
 */
export function shouldShowHighRollerWarning(betAmount: number): boolean {
  return betAmount >= BET_CONFIG.HIGH_ROLLER_ROOM.SOFT_CAP
}

/**
 * Get room type based on bet amount
 */
export function getRoomTypeForBet(betAmount: number): "normal" | "high_roller" {
  return betAmount >= BET_CONFIG.HIGH_ROLLER_ROOM.MIN_BET ? "high_roller" : "normal"
}
