import type { Cluster } from "@solana/web3.js"

export type SolanaNetwork = "devnet" | "mainnet" | "testnet"

export interface SolanaConfig {
  network: SolanaNetwork
  cluster: Cluster
  rpcEndpoint: string
  datxMint: string
  mockMode: boolean
  adminWallets: string[]
}

/**
 * Get Solana configuration based on environment variables
 * Defaults to devnet with mock mode enabled for development
 */
export function getSolanaConfig(): SolanaConfig {
  const network = (process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet") as SolanaNetwork
  const mockMode = process.env.NEXT_PUBLIC_MOCK_WALLET === "true"

  // RPC endpoint: use explicit env var or derive from network
  const rpcEndpoint =
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
    (network === "mainnet" ? "https://api.mainnet-beta.solana.com" : "https://api.devnet.solana.com")

  // $DATX mint: use network-specific mint
  const datxMint =
    network === "mainnet"
      ? process.env.NEXT_PUBLIC_DATX_MINT_MAINNET || "DATXa5e3DMfb3K4GiqxdMhM4f9sTSZvGcqhFueMWnZm"
      : process.env.NEXT_PUBLIC_DATX_MINT_DEVNET || "6PgDjJFzAbP2R4PsVFvDsNqVcnWkJBCLmkjWb4PZH6X9"

  // Admin wallets: NEVER expose in client code
  // Admin checking is done server-side only in /api/admin-verify-wallet
  // Client-side does not have access to admin wallet list for security

  return {
    network,
    cluster: network as Cluster,
    rpcEndpoint,
    datxMint,
    mockMode,
    adminWallets: [], // Always empty on client - checked server-side
  }
}

/**
 * ⚠️ SECURITY: Admin wallet verification must be done SERVER-SIDE ONLY
 * Use /api/admin-verify-wallet endpoint instead
 * This function is deprecated and should not be used
 * @deprecated Use server-side /api/admin-verify-wallet endpoint
 */
export function isAdminWallet(wallet: string): boolean {
  console.warn("[v0] isAdminWallet() is deprecated - use server-side verification")
  // Always return false on client - real check happens on server
  return false
}

/**
 * Check if app is in live/production mode
 * When true: users cannot access mock mode, real wallet required
 * Admins can always toggle between modes for testing
 */
export function isLiveMode(): boolean {
  return process.env.NEXT_PUBLIC_LIVE_MODE === "true"
}
