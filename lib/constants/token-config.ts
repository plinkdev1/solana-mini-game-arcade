// Token configuration for $DATX spl-token betting system
export const TOKEN_CONFIG = {
  // $DATX mint address on Solana mainnet
  DATX_MINT: "DatXdcSQJEDVbJh8c8EaKvHaYXXqvAr5e7mUQDxJDfT",

  // Treasury wallet (70% of losses)
  TREASURY_WALLET: "AS6eLBveWWosdH1aQtefBxfvaJZDoqpoGmujemmcAcR4",

  // Team wallet (30% of losses)
  TEAM_WALLET: "E59YMzy1k4rrFX6v45PGpDbq5mJdjFEHsjD3NoVxNdhG",

  // Mock escrow wallet for testing (used in mock mode)
  MOCK_ESCROW_WALLET: "MockEscrowWalletAddressForTesting",

  // Decimals for $DATX token
  DECIMALS: 6,

  // Split percentages
  TREASURY_SPLIT: 0.7, // 70%
  TEAM_SPLIT: 0.3, // 30%
}

// Solana RPC endpoints
export const SOLANA_RPC = {
  MAINNET: "https://api.mainnet-beta.solana.com",
  DEVNET: "https://api.devnet.solana.com",
}
