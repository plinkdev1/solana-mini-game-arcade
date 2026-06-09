"use client"

import { useState, useEffect } from "react"
import { useWalletStore } from "@/lib/stores/wallet-store"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { WalletButtonStyled } from "./wallet-button-styled"
import { WalletModalOverlay } from "./wallet-modal-overlay"

export function WalletDisplay() {
  const { isConnected, publicKey, mode } = useWalletStore()
  const { disconnect } = useWallet()
  const { setVisible } = useWalletModal()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  // In mock mode, show mock address
  if (mode === "mock" && isConnected && publicKey) {
    const shortAddress = `${publicKey.substring(0, 6)}...${publicKey.substring(publicKey.length - 4)}`
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm font-mono text-pink-400 neon-pink hidden sm:inline">Connected: {shortAddress}</span>
        <WalletButtonStyled
          onClick={() => {
            useWalletStore.setState({ isConnected: false, publicKey: null })
          }}
          isConnected={true}
          label="Disconnect"
          className="sm:hidden"
        />
      </div>
    )
  }

  // In real mode, show styled wallet button
  if (mode === "real") {
    return (
      <>
        <WalletButtonStyled onClick={() => setVisible(true)} isConnected={isConnected} label="Select Wallet" />
        <WalletModalOverlay />
      </>
    )
  }

  return null
}
