"use client"

import { useEffect, useRef } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { useWalletStore } from "@/lib/stores/wallet-store"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"
import { getDatxMint } from "@/lib/anchor/escrow-client"
import { getAssociatedTokenAddress } from "@solana/spl-token"

/**
 * Component that syncs wallet adapter state with Zustand store
 * and fetches balances when wallet connects in real mode
 */
export function WalletAdapterSync() {
  const { connected, publicKey } = useWallet()
  const { connection } = useConnection()
  const {
    mode,
    isConnected,
    setConnected,
    setPublicKey,
    setSolBalance,
    setDatxBalance,
    setFetchingBalance,
    setLastBalanceUpdate,
    setError,
  } = useWalletStore()

  const lastFetchRef = useRef<string | null>(null)

  // Sync connection state from wallet adapter to Zustand store
  useEffect(() => {
    if (mode === "real") {
      console.log(
        "[v0] WalletAdapterSync: Syncing real wallet state - connected:",
        connected,
        "publicKey:",
        publicKey?.toBase58(),
      )
      setConnected(connected)
      setPublicKey(publicKey?.toBase58() || null)
    }
  }, [connected, publicKey, mode, setConnected, setPublicKey])

  // Fetch balances when connected in real mode
  useEffect(() => {
    const fetchBalances = async () => {
      if (mode !== "real") {
        console.log("[v0] WalletAdapterSync: Skipping balance fetch - mode is", mode)
        return
      }

      if (!connected || !publicKey) {
        console.log("[v0] WalletAdapterSync: Skipping balance fetch - wallet not connected")
        return
      }

      // Prevent duplicate fetches
      const fetchKey = `${publicKey.toBase58()}-${mode}`
      if (lastFetchRef.current === fetchKey) {
        console.log("[v0] WalletAdapterSync: Skipping duplicate fetch")
        return
      }
      lastFetchRef.current = fetchKey

      console.log("[v0] WalletAdapterSync: Fetching real balances for", publicKey.toBase58())
      setFetchingBalance(true)

      try {
        // Fetch SOL balance
        const solBalanceLamports = await connection.getBalance(publicKey)
        const solBalance = solBalanceLamports / LAMPORTS_PER_SOL
        setSolBalance(solBalance)
        console.log("[v0] WalletAdapterSync: SOL balance =", solBalance)

        // Fetch $DATX balance
        try {
          const datxMint = getDatxMint()
          console.log("[v0] WalletAdapterSync: Fetching DATX with mint =", datxMint.toBase58())
          const ata = await getAssociatedTokenAddress(datxMint, publicKey)
          const tokenBalance = await connection.getTokenAccountBalance(ata)
          const datxBalance = Number(tokenBalance.value.uiAmount || 0)
          setDatxBalance(datxBalance)
          console.log("[v0] WalletAdapterSync: DATX balance =", datxBalance)
        } catch (tokenError) {
          // Token account may not exist yet (user has no $DATX)
          console.log("[v0] WalletAdapterSync: No DATX token account found, setting balance to 0")
          setDatxBalance(0)
        }

        setLastBalanceUpdate(Date.now())
        setError(null)
      } catch (error) {
        console.error("[v0] WalletAdapterSync: Error fetching balances", error)
        setError("Failed to fetch wallet balances")
      } finally {
        setFetchingBalance(false)
      }
    }

    fetchBalances()
  }, [
    connected,
    publicKey,
    mode,
    connection,
    setFetchingBalance,
    setSolBalance,
    setDatxBalance,
    setLastBalanceUpdate,
    setError,
  ])

  useEffect(() => {
    if (mode === "real" && connected && publicKey) {
      // Force re-fetch when switching to real mode
      lastFetchRef.current = null
    }
  }, [mode, connected, publicKey])

  return null // This component only syncs state, no UI
}
