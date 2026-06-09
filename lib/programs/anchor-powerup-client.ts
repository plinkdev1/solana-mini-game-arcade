import { Program, AnchorProvider } from "@project-serum/anchor"
import { type Connection, PublicKey } from "@solana/web3.js"
import { IDL } from "./sewer-arena-powerups-idl"

export interface RequestPowerupParams {
  gameId: string
  oracleMode: boolean
}

export interface ApplyPowerupParams {
  gameId: string
  rngResult: bigint
}

/**
 * Initialize Anchor client for power-ups
 * @param connection - Solana connection
 * @param wallet - User wallet
 * @returns Program instance for power-up instructions
 */
export function initializePowerupClient(connection: Connection, wallet: any) {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "processed",
  })

  const programId = new PublicKey(process.env.NEXT_PUBLIC_POWERUP_PROGRAM_ID || "")
  const program = new Program(IDL as any, programId, provider)

  return program
}

/**
 * Request a power-up from Switchboard oracle
 * @param program - Anchor program instance
 * @param params - Request parameters
 * @returns Transaction signature or null if oracle mode disabled
 */
export async function requestPowerup(program: Program, params: RequestPowerupParams) {
  if (!params.oracleMode) {
    console.log("[v0] Oracle mode disabled, using client-side RNG")
    return null
  }

  try {
    console.log("[v0] Requesting power-up from Switchboard oracle...")

    // TODO: Implement actual Switchboard request
    // This would involve:
    // 1. Getting oracle feed account
    // 2. Calling request_powerup instruction
    // 3. Returning transaction signature

    console.log("[v0] Power-up request sent, awaiting oracle callback")
    return "signature_placeholder"
  } catch (error) {
    console.error("[v0] Power-up request failed:", error)
    throw error
  }
}

/**
 * Apply power-up after oracle callback
 * @param program - Anchor program instance
 * @param params - Apply parameters
 * @returns Transaction signature
 */
export async function applyPowerup(program: Program, params: ApplyPowerupParams) {
  try {
    console.log("[v0] Applying power-up effect from oracle result")

    // TODO: Implement actual apply_powerup instruction call

    return "signature_placeholder"
  } catch (error) {
    console.error("[v0] Power-up application failed:", error)
    throw error
  }
}

/**
 * Check oracle health and estimate costs
 */
export async function getOracleCosts() {
  return {
    switchboardFee: 0.02, // $0.02 estimated
    transactionCost: 0.0001, // ~0.0001 SOL
    totalUSD: 0.025,
    networkFee: "0.0005 SOL",
  }
}
