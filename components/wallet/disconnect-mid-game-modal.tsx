"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Wifi } from "lucide-react"

interface DisconnectMidGameModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onReconnect: () => void
  onForfeit: () => void
}

export function DisconnectMidGameModal({ open, onOpenChange, onReconnect, onForfeit }: DisconnectMidGameModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-amber-500/30 bg-black/95 backdrop-blur">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Wifi className="w-6 h-6 text-amber-400 animate-pulse" />
            <DialogTitle className="text-amber-400">Wallet Disconnected</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground mt-2">
            Your wallet connection was lost during the game. Reconnect to continue or forfeit the match.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-6 bg-amber-500/5 p-4 rounded-lg border border-amber-500/20">
          <p className="text-sm text-amber-300">
            <span className="font-bold">⏱️ Time remaining:</span> Reconnect within 2 minutes to resume
          </p>
        </div>

        <div className="space-y-3 mt-6">
          <Button onClick={onReconnect} className="w-full bg-green-600/70 hover:bg-green-600 text-white font-bold">
            Reconnect Wallet
          </Button>

          <Button onClick={onForfeit} className="w-full bg-red-600/70 hover:bg-red-600 text-white">
            Forfeit Match
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          Forfeiting will result in a loss. Reconnecting keeps the match active.
        </p>
      </DialogContent>
    </Dialog>
  )
}
