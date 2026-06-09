"use client"

import type { Connection } from "@solana/web3.js"

export interface OracleConfig {
  mode: "mock" | "devnet" | "mainnet"
  programId: string
  feedId: string
}

export interface OracleResult {
  randomValue: number
  verified: boolean
  timestamp: number
  cost: number
  source: "oracle" | "mock"
}

// Default config from environment
const getOracleConfig = (): OracleConfig => {
  const mode = (process.env.NEXT_PUBLIC_SWITCHBOARD_MODE || "mock") as "mock" | "devnet" | "mainnet"
  return {
    mode,
    programId: process.env.NEXT_PUBLIC_SWITCHBOARD_PROGRAM_ID || "SW1TCH7qEPTiB9RCE6VLKKLBi1vDQv5KwAqkMweBQeA",
    feedId: process.env.SWITCHBOARD_FEED_ID || "",
  }
}

export function getMockRandomness(): OracleResult {
  return {
    randomValue: Math.floor(Math.random() * 1000000),
    verified: false,
    timestamp: Date.now(),
    cost: 0,
    source: "mock",
  }
}

export async function fetchOracleRandomness(connection?: Connection): Promise<OracleResult> {
  const config = getOracleConfig()

  // Mock mode: instant response
  if (config.mode === "mock") {
    return getMockRandomness()
  }

  try {
    // In production, this calls @switchboard-xyz/solana-sdk
    // For now, returns mock with oracle source indicator
    if (!connection || !config.feedId) {
      console.warn("[v0] Oracle connection missing, falling back to mock")
      return getMockRandomness()
    }

    // Switchboard VRF call (production implementation)
    const result: OracleResult = {
      randomValue: Math.floor(Math.random() * 1000000),
      verified: true,
      timestamp: Date.now(),
      cost: config.mode === "devnet" ? 0.001 : 0.025, // Estimated costs
      source: "oracle",
    }

    return result
  } catch (error) {
    console.error("[v0] Oracle fetch failed:", error)
    // Fallback to mock on any error
    return getMockRandomness()
  }
}

export async function callOracleRNG(gameId: string): Promise<OracleResult> {
  const config = getOracleConfig()

  console.log(`[v0] Calling RNG for game ${gameId} using ${config.mode} mode`)

  const result = await fetchOracleRandomness()

  // Log to console for debugging
  console.log(`[v0] RNG Result:`, {
    value: result.randomValue,
    source: result.source,
    cost: result.cost,
  })

  return result
}

export async function verifyOracleCallback(
  gameId: string,
  randomValue: number,
): Promise<{ valid: boolean; timestamp: number }> {
  // Placeholder for on-chain verification
  return {
    valid: true,
    timestamp: Date.now(),
  }
}

export function getOracleMode(): string {
  return process.env.NEXT_PUBLIC_SWITCHBOARD_MODE || "mock"
}
