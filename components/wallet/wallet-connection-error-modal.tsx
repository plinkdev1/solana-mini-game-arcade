"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { useWalletStore } from "@/lib/stores/wallet-store"

interface WalletConnectionErrorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  adapterName?: string
}

export function WalletConnectionErrorModal({
  open,
  onOpenChange,
  adapterName = "Wallet",
}: WalletConnectionErrorModalProps) {
  const { setMode, setError } = useWalletStore()
  const [retrying, setRetrying] = useState(false)

  const handleRetry = async () => {
    setRetrying(true)
    setTimeout(() => {
      setRetrying(false)
    }, 2000)
  }

  const handleSwitchToMock = () => {
    setMode("mock")
    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-red-500/30 bg-black/95 backdrop-blur">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-400 animate-pulse" />
            <DialogTitle className="text-red-400">Wallet Connection Failed</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground mt-2">
            Could not connect to {adapterName}. Try another adapter or switch to mock mode for testing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-6">
          <Button
            onClick={handleRetry}
            disabled={retrying}
            className="w-full bg-red-600/70 hover:bg-red-600 text-white"
          >
            {retrying ? "Retrying..." : "Retry Connection"}
          </Button>

          <Button
            onClick={handleSwitchToMock}
            variant="outline"
            className="w-full border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 bg-transparent"
          >
            Switch to Mock Mode
          </Button>

          <Button onClick={() => onOpenChange(false)} variant="ghost" className="w-full text-muted-foreground">
            Cancel
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          Mock mode is for development testing only. Use a real wallet on mainnet.
        </p>
      </DialogContent>
    </Dialog>
  )
}
