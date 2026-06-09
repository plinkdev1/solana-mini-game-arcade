"use client"

import { useState } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Transaction, PublicKey } from "@solana/web3.js"
import { useToast } from "@/hooks/use-toast"
import { useEscrowStore } from "@/lib/stores/escrow-store"
import {
  createCreateEscrowInstruction,
  createDepositInstruction,
  createSettleInstruction,
} from "@/lib/anchor/escrow-instructions"
import { getEscrowPda } from "@/lib/anchor/escrow-client"
import { TransactionToast } from "./transaction-toast"

interface EscrowTransactionHandlerProps {
  player1: string
  player2: string
  gameId: string
  betAmount: number
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function EscrowTransactionHandler({
  player1,
  player2,
  gameId,
  betAmount,
  onSuccess,
  onError,
}: EscrowTransactionHandlerProps) {
  const { connection } = useConnection()
  const { publicKey, sendTransaction, signTransaction } = useWallet()
  const { toast } = useToast()
  const { txStatus, setTxStatus, setTxError, mockMode, setEscrowPda, setDepositTxSignature } = useEscrowStore()

  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastTxSig, setToastTxSig] = useState<string>()

  const handleCreateEscrow = async () => {
    if (!publicKey || !signTransaction) return

    try {
      setTxStatus("creating")
      setShowToast(true)
      setToastMessage("Creating escrow...")

      if (mockMode) {
        // Mock mode: skip real transaction
        const escrow = getEscrowPda(new PublicKey(player1), new PublicKey(player2), gameId)
        setEscrowPda(escrow)
        setTxStatus("idle")
        return
      }

      const createIx = await createCreateEscrowInstruction(
        new PublicKey(player1),
        new PublicKey(player2),
        gameId,
        BigInt(betAmount * 1e6),
      )

      const tx = new Transaction().add(createIx)
      const signature = await sendTransaction(tx, connection)

      await connection.confirmTransaction(signature, "confirmed")
      setDepositTxSignature(signature)
      setToastTxSig(signature)
      setToastMessage("Escrow created!")
      setTxStatus("idle")
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to create escrow"
      setTxError(errorMsg)
      setToastMessage(errorMsg)
      setTxStatus("error")
      onError?.(errorMsg)
    }
  }

  const handleDeposit = async (isPlayer1: boolean) => {
    if (!publicKey || !signTransaction) return

    try {
      setTxStatus(isPlayer1 ? "depositing_p1" : "depositing_p2")
      setShowToast(true)
      setToastMessage(`Player ${isPlayer1 ? "1" : "2"} depositing...`)

      if (mockMode) {
        // Mock mode: skip real transaction
        setTxStatus("idle")
        return
      }

      const depositIx = await createDepositInstruction(
        publicKey,
        new PublicKey(player1),
        new PublicKey(player2),
        gameId,
        BigInt(betAmount * 1e6),
      )

      const tx = new Transaction().add(depositIx)
      const signature = await sendTransaction(tx, connection)

      await connection.confirmTransaction(signature, "confirmed")
      setToastTxSig(signature)
      setToastMessage(`Player ${isPlayer1 ? "1" : "2"} deposited!`)
      setTxStatus("idle")
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Deposit failed"
      setTxError(errorMsg)
      setToastMessage(errorMsg)
      setTxStatus("error")
      onError?.(errorMsg)
    }
  }

  const handleSettle = async (winner: string) => {
    if (!publicKey || !signTransaction) return

    try {
      setTxStatus("settling")
      setShowToast(true)
      setToastMessage("Settling game...")

      if (mockMode) {
        // Mock mode: skip real transaction
        setTxStatus("success")
        setToastMessage("Game settled! (mock mode)")
        onSuccess?.()
        return
      }

      const settleIx = await createSettleInstruction(
        new PublicKey(winner),
        new PublicKey(player1),
        new PublicKey(player2),
        gameId,
        BigInt(betAmount * 1e6),
      )

      const tx = new Transaction().add(settleIx)
      const signature = await sendTransaction(tx, connection)

      await connection.confirmTransaction(signature, "confirmed")
      setToastTxSig(signature)
      setToastMessage("Game settled!")
      setTxStatus("success")
      onSuccess?.()
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Settlement failed"
      setTxError(errorMsg)
      setToastMessage(errorMsg)
      setTxStatus("error")
      onError?.(errorMsg)
    }
  }

  return (
    <div className="space-y-4">
      {showToast && (
        <TransactionToast
          status={txStatus === "idle" ? "success" : txStatus === "error" ? "error" : "pending"}
          message={toastMessage}
          txSignature={toastTxSig}
          onDismiss={() => setShowToast(false)}
        />
      )}

      <div className="flex gap-2">
        <button
          onClick={handleCreateEscrow}
          disabled={txStatus !== "idle"}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded font-bold disabled:opacity-50"
        >
          {mockMode ? "✓ Create Escrow (Mock)" : "Create Escrow"}
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => handleDeposit(true)}
          disabled={txStatus !== "idle"}
          className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded font-bold disabled:opacity-50"
        >
          {mockMode ? "✓ Deposit P1 (Mock)" : "Deposit P1"}
        </button>
        <button
          onClick={() => handleDeposit(false)}
          disabled={txStatus !== "idle"}
          className="flex-1 px-4 py-2 bg-lime-600 text-white rounded font-bold disabled:opacity-50"
        >
          {mockMode ? "✓ Deposit P2 (Mock)" : "Deposit P2"}
        </button>
      </div>

      <button
        onClick={() => handleSettle(player1)}
        disabled={txStatus !== "idle"}
        className="w-full px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded font-bold disabled:opacity-50"
      >
        {mockMode ? "✓ Settle (Mock)" : "Settle Game"}
      </button>
    </div>
  )
}
