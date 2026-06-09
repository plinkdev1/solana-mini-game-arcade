"use client"

import { useState, useEffect } from "react"
import { useWalletStore } from "@/lib/stores/wallet-store"
import { getSolanaConfig, isAdminWallet } from "@/lib/config/solana-config"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { toast } = useToast()
  const { mode, setMode, network, setNetwork, publicKey } = useWalletStore()
  const [isAdmin, setIsAdmin] = useState(false)
  const config = getSolanaConfig()

  const isLiveMode = process.env.NEXT_PUBLIC_LIVE_MODE === "true"

  // Check if connected wallet is admin
  useEffect(() => {
    if (publicKey && config.adminWallets.length > 0) {
      setIsAdmin(isAdminWallet(publicKey))
    } else {
      setIsAdmin(false)
    }
  }, [publicKey, config.adminWallets])

  const handleModeChange = (isMock: boolean) => {
    if (isLiveMode && !isAdmin && isMock) {
      toast({
        title: "Production Mode",
        description: "Mock mode is disabled in production. Use real wallet only.",
        variant: "destructive",
      })
      return
    }

    setMode(isMock ? "mock" : "real")
    toast({
      title: isMock ? "Mock Mode Enabled" : "Real Mode Enabled",
      description: isMock ? "Using fake wallet for testing" : "Connect your Phantom wallet",
    })
    // Reload page to reinitialize providers
    setTimeout(() => window.location.reload(), 500)
  }

  const handleNetworkChange = (isDevnet: boolean) => {
    if (!isAdmin) {
      toast({
        title: "Admin Only",
        description: "Network switching is restricted to admins",
        variant: "destructive",
      })
      return
    }

    setNetwork(isDevnet ? "devnet" : "mainnet")
    toast({
      title: `Switching to ${isDevnet ? "Devnet" : "Mainnet"}`,
      description: "Reloading app with new network...",
    })
    // Reload page to reinitialize providers
    setTimeout(() => window.location.reload(), 500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-b from-slate-950 via-slate-900 to-black border border-amber-500/30 shadow-lg shadow-amber-500/20 max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-amber-400 text-xl">Flush Settings</DialogTitle>
            {isAdmin && (
              <Badge className="bg-purple-600 text-white flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Admin Mode
              </Badge>
            )}
          </div>
          <DialogDescription className="text-amber-200/70">
            {isAdmin ? "Admin settings for staging/network control" : "Configure wallet mode"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Wallet Mode Section */}
          <div className="space-y-3 p-4 rounded-lg bg-black/50 border border-amber-500/20">
            <div className="flex items-center justify-between">
              <Label className="text-amber-300 font-semibold">
                Wallet Mode
                {isLiveMode && !isAdmin && (
                  <Badge variant="outline" className="ml-2 text-xs bg-red-950/50 text-red-300 border-red-500/30">
                    Production
                  </Badge>
                )}
              </Label>
              <Switch
                checked={mode === "mock"}
                onCheckedChange={handleModeChange}
                disabled={isLiveMode && !isAdmin && mode === "real"}
                className="bg-amber-600"
              />
            </div>
            <p className="text-xs text-amber-200/60">
              {mode === "mock"
                ? "Mock: Using fake wallet for testing with 1000 mock $DATX"
                : "Real: Connect your Phantom, Solflare, or Ledger wallet"}
            </p>
            {isLiveMode && !isAdmin && (
              <p className="text-xs text-red-300 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                This is production mode - only real wallet connections allowed
              </p>
            )}
          </div>

          {/* Admin Network Section */}
          {isAdmin && (
            <div className="space-y-3 p-4 rounded-lg bg-purple-950/30 border border-purple-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <Label className="text-purple-400 font-semibold">Admin Only – Network</Label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-purple-300">
                  {network === "devnet"
                    ? "Devnet: Testing network with fake $DATX"
                    : "Mainnet: Production network (use with caution)"}
                </span>
                <Switch
                  checked={network === "devnet"}
                  onCheckedChange={handleNetworkChange}
                  className="bg-purple-600"
                />
              </div>
              <p className="text-xs text-purple-300/60">RPC: {config.rpcEndpoint}</p>

              <div className="mt-3 p-2 rounded bg-purple-950/50 border border-purple-500/20">
                <p className="text-xs text-purple-200">
                  <span className="font-semibold">Live Mode Status:</span> {isLiveMode ? "ENABLED" : "DISABLED"}
                </p>
                <p className="text-xs text-purple-300/70 mt-1">
                  {isLiveMode
                    ? "Users cannot access mock mode. Real wallet required."
                    : "Users can access mock mode for testing."}
                </p>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/20">
            <p className="text-xs text-amber-200/70">
              Current Configuration: <br />
              Mode: <span className="font-semibold text-amber-300">{mode.toUpperCase()}</span> | Network:{" "}
              <span className="font-semibold text-amber-300">{network.toUpperCase()}</span>
            </p>
          </div>

          {/* Compliance Disclaimer */}
          <div className="p-3 rounded-lg bg-red-950/20 border border-red-500/20">
            <p className="text-xs text-red-200 font-semibold mb-1">Compliance Notice</p>
            <p className="text-xs text-red-300/70">
              Mock mode is for testing only. Real bets are for entertainment purposes only. Always gamble responsibly.
              By using this app, you agree to play fairly and follow all house rules.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-amber-500/30">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
