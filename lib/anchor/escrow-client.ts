import { PublicKey } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { getSolanaConfig } from "@/lib/config/solana-config"

// Program constants (replace with actual deployed program ID)
// export const SEWER_ARENA_ESCROW_PROGRAM_ID = new PublicKey("11111111111111111111111111111111") // TODO: Replace with actual program ID
// export const DATX_MINT = new PublicKey("11111111111111111111111111111111") // TODO: Replace with actual $DATX mint

export function getSewerArenaEscrowProgramId(): PublicKey {
  const config = getSolanaConfig()
  // TODO: Replace with actual deployed program IDs
  const programIds = {
    devnet: new PublicKey(process.env.NEXT_PUBLIC_ESCROW_PROGRAM_ID_DEVNET || "11111111111111111111111111111111"),
    mainnet: new PublicKey(process.env.NEXT_PUBLIC_ESCROW_PROGRAM_ID_MAINNET || "11111111111111111111111111111111"),
  }
  return programIds[config.network] || programIds.devnet
}

export function getDatxMint(): PublicKey {
  const config = getSolanaConfig()
  return new PublicKey(config.datxMint)
}

// Legacy exports for backward compatibility
export const SEWER_ARENA_ESCROW_PROGRAM_ID = getSewerArenaEscrowProgramId()
export const DATX_MINT = getDatxMint()

// Rake wallet PDAs (derive from program ID)
export const getTreasuryPda = () => {
  return PublicKey.findProgramAddressSync([Buffer.from("treasury")], getSewerArenaEscrowProgramId())[0]
}

export const getTeamPda = () => {
  return PublicKey.findProgramAddressSync([Buffer.from("team")], getSewerArenaEscrowProgramId())[0]
}

// Escrow PDA: seeded by player1 + player2 + game_id
export const getEscrowPda = (player1: PublicKey, player2: PublicKey, gameId: string) => {
  const seeds = [Buffer.from("escrow"), player1.toBuffer(), player2.toBuffer(), Buffer.from(gameId)]
  return PublicKey.findProgramAddressSync(seeds, getSewerArenaEscrowProgramId())[0]
}

// Get associated token accounts
export const getAssociatedTokenAddress = async (mint: PublicKey, owner: PublicKey, allowOffCurve = false) => {
  return PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  )[0]
}
