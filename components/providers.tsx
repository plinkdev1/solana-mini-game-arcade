"use client"

import type React from "react"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom"
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare"
import { LedgerWalletAdapter } from "@solana/wallet-adapter-ledger"
import { useMemo } from "react"
import { getSolanaConfig } from "@/lib/config/solana-config"
import { useWalletStore } from "@/lib/stores/wallet-store"
import { WalletErrorToast } from "@/components/wallet/wallet-error-toast"
import { AdminUpdatesListener } from "@/components/admin-updates-listener"
import { WalletAdapterSync } from "@/components/wallet/wallet-adapter-sync"

// Import wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css"

/**
 * Root provider component for client-side setup.
 * Dynamically configures Solana wallet adapters based on environment and mock mode.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const config = getSolanaConfig()
  const mode = useWalletStore((state) => state.mode)
  const network = useWalletStore((state) => state.network)

  const rpcEndpoint = useMemo(() => config.rpcEndpoint, [config.rpcEndpoint, network])

  // This allows users to switch modes without page reload
  const wallets = useMemo(() => {
    return [new PhantomWalletAdapter(), new SolflareWalletAdapter(), new LedgerWalletAdapter()]
  }, [])

  return (
    <ConnectionProvider endpoint={rpcEndpoint}>
      <WalletProvider wallets={wallets} autoConnect={mode === "real"}>
        <WalletModalProvider>
          <WalletAdapterSync />
          <WalletErrorToast />
          <AdminUpdatesListener />
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
