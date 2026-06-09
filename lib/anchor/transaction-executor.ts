"use client"

import { type Connection, type Transaction, PublicKey } from "@solana/web3.js"
import { useWallet } from "@solana/wallet-adapter-react"
import { useToast } from "@/hooks/use-toast"
import { useWalletStore } from "@/lib/stores/wallet-store"
import { getSolanaConfig } from "@/lib/config/solana-config"

export function useTransactionExecutor() {
  const { signTransaction, sendTransaction, connected } = useWallet()
  const { toast } = useToast()
  const { mode, deductBalance } = useWalletStore()
  const config = getSolanaConfig()

  const executeTransaction = async (
    tx: Transaction,
    connection: Connection,
    txName = "Transaction",
  ): Promise<string | null> => {
    try {
      if (mode === "mock") {
        console.log(`[v0] Mock TX: ${txName}`)
        toast({
          title: `Simulating ${txName}`,
          description: "Using mock wallet (no real tx sent)",
        })
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const mockSig = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        toast({
          title: `${txName} Confirmed`,
          description: "Mock transaction simulated successfully",
        })
        return mockSig
      }

      // Real transaction execution
      if (!connected || !signTransaction) {
        toast({
          title: "Wallet Not Connected",
          description: "Please connect your wallet to proceed",
          variant: "destructive",
        })
        return null
      }

      console.log(`[v0] Real TX: ${txName}`)
      toast({
        title: `Sending ${txName}`,
        description: "Signing transaction with your wallet...",
      })

      const { blockhash } = await connection.getLatestBlockhash()
      tx.recentBlockhash = blockhash
      tx.feePayer = new PublicKey(useWalletStore.getState().publicKey!)

      const signedTx = await signTransaction(tx)
      const signature = await sendTransaction(signedTx, connection)

      toast({
        title: `${txName} Confirmed`,
        description: `Signature: ${signature.substring(0, 8)}...`,
      })

      console.log(`[v0] TX Signature: ${signature}`)
      return signature
    } catch (error: any) {
      console.error(`[v0] TX Error:`, error)
      toast({
        title: `${txName} Failed`,
        description: error.message || "Transaction failed",
        variant: "destructive",
      })
      return null
    }
  }

  return { executeTransaction }
}
