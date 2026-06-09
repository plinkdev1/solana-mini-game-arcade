"use client"

import { useState } from "react"
import { useWalletStore } from "@/lib/stores/wallet-store"
import { mockAdapter, phantomAdapter, solflareAdapter } from "@/lib/services/wallet-adapters"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Wallet, LogOut } from "lucide-react"
import { WalletModal } from "./wallet-modal"

export function WalletConnectButton() {
  const [modalOpen, setModalOpen] = useState(false)
  const { isConnected, publicKey, mockMode } = useWalletStore()
  const { toast } = useToast()

  const handleDisconnect = async () => {
    if (mockMode) {
      await mockAdapter.disconnect()
    } else {
      // Try to disconnect from real wallet
      if ((window as any).solana?.disconnect) {
        await phantomAdapter.disconnect()
      } else if ((window as any).solflare?.disconnect) {
        await solflareAdapter.disconnect()
      }
    }

    toast({
      title: "Wallet Disconnected",
    })
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm px-3 py-2 bg-primary/20 rounded-md">
          <div className="text-xs text-muted-foreground">Connected</div>
          <div className="font-mono text-sm">{publicKey?.slice(0, 10)}...</div>
          {mockMode && <div className="text-xs text-accent mt-1">Mock Mode</div>}
        </div>
        <Button variant="ghost" size="sm" onClick={handleDisconnect}>
          <LogOut size={16} />
        </Button>
      </div>
    )
  }

  return (
    <>
      <Button onClick={() => setModalOpen(true)} className="flex items-center gap-2">
        <Wallet size={16} />
        Connect Wallet
      </Button>
      <WalletModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  )
}
