"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useWalletStore } from "@/lib/stores/wallet-store"
import { WALLET_ADAPTERS } from "@/lib/services/wallet-adapters"
import { useToast } from "@/hooks/use-toast"

interface WalletModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WalletModal({ open, onOpenChange }: WalletModalProps) {
  const [connecting, setConnecting] = useState<string | null>(null)
  const { setError } = useWalletStore()
  const { toast } = useToast()

  const handleConnect = async (adapterName: string) => {
    setConnecting(adapterName)

    const adapter = WALLET_ADAPTERS.find((a) => a.name === adapterName)
    if (!adapter) return

    const publicKey = await adapter.connect()

    if (publicKey) {
      toast({
        title: `${adapter.name} Connected`,
        description: publicKey.slice(0, 16) + "...",
      })
      onOpenChange(false)
    } else {
      toast({
        title: "Connection Failed",
        description: "Please try another wallet",
        variant: "destructive",
      })
    }

    setConnecting(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border border-primary/50">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>Choose a wallet to connect to Sewer Arena</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          {WALLET_ADAPTERS.map((adapter) => (
            <Button
              key={adapter.name}
              onClick={() => handleConnect(adapter.name)}
              disabled={connecting === adapter.name}
              variant="outline"
              className="w-full justify-start gap-3 text-base"
            >
              <span className="text-lg">{adapter.icon}</span>
              {adapter.name}
              {connecting === adapter.name && <span className="ml-auto text-xs">Connecting...</span>}
            </Button>
          ))}
        </div>

        <div className="mt-4 p-3 bg-secondary/50 rounded text-sm text-muted-foreground">
          <p>
            <strong>Testing:</strong> Use "Mock (Dev)" for testing without a real wallet.
          </p>
          <p className="mt-2">
            <strong>Real wallets:</strong> Phantom, Solflare, or Ledger for mainnet gameplay.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
