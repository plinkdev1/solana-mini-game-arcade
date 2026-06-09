import { type PublicKey, TransactionInstruction, SystemProgram } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
import {
  getSewerArenaEscrowProgramId,
  getDatxMint,
  getTreasuryPda,
  getTeamPda,
  getEscrowPda,
  getAssociatedTokenAddress,
} from "./escrow-client"

// Instruction layouts (matching Anchor program)
const IDL = {
  name: "sewer_arena_escrow",
  instructions: [
    { name: "createEscrow", discriminator: [0] },
    { name: "deposit", discriminator: [1] },
    { name: "settle", discriminator: [2] },
  ],
}

export async function createCreateEscrowInstruction(
  player1: PublicKey,
  player2: PublicKey,
  gameId: string,
  betAmount: bigint,
): Promise<TransactionInstruction> {
  const escrowPda = getEscrowPda(player1, player2, gameId)
  const datxMint = getDatxMint()
  const escrowAta = await getAssociatedTokenAddress(datxMint, escrowPda, true)

  return new TransactionInstruction({
    programId: getSewerArenaEscrowProgramId(),
    keys: [
      { pubkey: escrowPda, isSigner: false, isWritable: true },
      { pubkey: player1, isSigner: true, isWritable: true },
      { pubkey: player2, isSigner: false, isWritable: false },
      { pubkey: datxMint, isSigner: false, isWritable: false },
      { pubkey: escrowAta, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([
      Buffer.from([0]), // instruction discriminator
      Buffer.alloc(8), // placeholder for gameId length + data
    ]),
  })
}

export async function createDepositInstruction(
  player: PublicKey,
  player1: PublicKey,
  player2: PublicKey,
  gameId: string,
  betAmount: bigint,
): Promise<TransactionInstruction> {
  const escrowPda = getEscrowPda(player1, player2, gameId)
  const datxMint = getDatxMint()
  const playerAta = await getAssociatedTokenAddress(datxMint, player)
  const escrowAta = await getAssociatedTokenAddress(datxMint, escrowPda, true)

  return new TransactionInstruction({
    programId: getSewerArenaEscrowProgramId(),
    keys: [
      { pubkey: escrowPda, isSigner: false, isWritable: true },
      { pubkey: player, isSigner: true, isWritable: true },
      { pubkey: playerAta, isSigner: false, isWritable: true },
      { pubkey: escrowAta, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([
      Buffer.from([1]), // instruction discriminator
      Buffer.alloc(8), // placeholder for amount
    ]),
  })
}

export async function createSettleInstruction(
  winner: PublicKey,
  player1: PublicKey,
  player2: PublicKey,
  gameId: string,
  betAmount: bigint,
): Promise<TransactionInstruction> {
  const escrowPda = getEscrowPda(player1, player2, gameId)
  const datxMint = getDatxMint()
  const escrowAta = await getAssociatedTokenAddress(datxMint, escrowPda, true)
  const winnerAta = await getAssociatedTokenAddress(datxMint, winner)
  const treasuryAta = await getAssociatedTokenAddress(datxMint, getTreasuryPda(), true)
  const teamAta = await getAssociatedTokenAddress(datxMint, getTeamPda(), true)

  return new TransactionInstruction({
    programId: getSewerArenaEscrowProgramId(),
    keys: [
      { pubkey: escrowPda, isSigner: false, isWritable: true },
      { pubkey: winner, isSigner: true, isWritable: false },
      { pubkey: escrowAta, isSigner: false, isWritable: true },
      { pubkey: winnerAta, isSigner: false, isWritable: true },
      { pubkey: treasuryAta, isSigner: false, isWritable: true },
      { pubkey: teamAta, isSigner: false, isWritable: true },
      { pubkey: getTreasuryPda(), isSigner: false, isWritable: false },
      { pubkey: getTeamPda(), isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([
      Buffer.from([2]), // instruction discriminator
    ]),
  })
}
