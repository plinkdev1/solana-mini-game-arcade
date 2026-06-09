"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useWalletStore } from "@/lib/stores/wallet-store"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { Wallet, LogOut, Loader2 } from "lucide-react"

export function WalletModalFooter() {
  const [open, setOpen] = useState(false)
  const { datxBalance, mode, setConnected, setPublicKey, setSolBalance, setDatxBalance } = useWalletStore()

  const { connected, publicKey, disconnect, connecting } = useWallet()
  const { setVisible } = useWalletModal()

  useEffect(() => {
    setConnected(connected)
    setPublicKey(publicKey?.toBase58() || null)
  }, [connected, publicKey, setConnected, setPublicKey])

  const handleConnect = () => {
    if (mode === "mock") {
      // In mock mode, simulate connection
      setConnected(true)
      setPublicKey("MockWallet" + Math.random().toString(36).slice(2, 10))
      setSolBalance(5.0)
      setDatxBalance(1000)
      setOpen(false)
    } else {
      // In real mode, open the wallet adapter modal
      setVisible(true)
      setOpen(false)
    }
  }

  const handleDisconnect = async () => {
    if (mode === "real" && connected) {
      await disconnect()
    }
    setConnected(false)
    setPublicKey(null)
    setSolBalance(0)
    setOpen(false)
  }

  const displayAddress = publicKey?.toBase58() || useWalletStore.getState().publicKey
  const isConnected = connected || (mode === "mock" && useWalletStore.getState().isConnected)

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 border border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.5)] hover:shadow-[0_0_25px_rgba(236,72,153,0.7)] transition-all duration-300"
      >
        <Wallet className="w-4 h-4 mr-2" />
        {isConnected ? "Wallet" : "Connect Wallet"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-gradient-to-br from-black/95 via-pink-950/20 to-black/95 border border-pink-500/50 backdrop-blur-xl shadow-[0_0_50px_rgba(236,72,153,0.3)]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black bg-gradient-to-r from-pink-400 via-rose-400 to-pink-400 bg-clip-text text-transparent">
              Flush Your Wallet
            </DialogTitle>
            <DialogDescription className="text-pink-300/80">
              {mode === "mock"
                ? "Mock mode active – simulated wallet for testing"
                : "Connect your Solana wallet to start playing for real"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {isConnected && displayAddress ? (
              <div className="p-4 bg-gradient-to-br from-pink-600/10 to-rose-600/10 border border-pink-400/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-pink-300">Connected Wallet:</p>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      mode === "mock"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/50"
                        : "bg-green-500/20 text-green-400 border border-green-500/50"
                    }`}
                  >
                    {mode === "mock" ? "MOCK" : "REAL"}
                  </span>
                </div>
                <p className="font-mono text-pink-400 text-xs break-all bg-black/30 p-2 rounded">
                  {displayAddress.slice(0, 8)}...{displayAddress.slice(-8)}
                </p>
                <p className="text-sm text-pink-300 mt-3">
                  Balance: <span className="font-bold text-pink-400 text-lg">{datxBalance.toFixed(2)} $DATX</span>
                </p>
              </div>
            ) : (
              <div className="p-4 bg-gradient-to-br from-pink-600/10 to-rose-600/10 border border-pink-400/50 rounded-lg text-center">
                <Wallet className="w-12 h-12 mx-auto mb-3 text-pink-400 opacity-50" />
                <p className="text-sm text-pink-300">
                  {mode === "mock"
                    ? "Click below to simulate wallet connection"
                    : "Connect with Phantom, Solflare, or Ledger"}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              {isConnected ? (
                <>
                  <Button
                    onClick={() => setOpen(false)}
                    className="flex-1 bg-pink-600 hover:bg-pink-500 text-white border border-pink-400"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={handleDisconnect}
                    variant="outline"
                    className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10 bg-transparent"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white border border-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.4)]"
                >
                  {connecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4 mr-2" />
                      {mode === "mock" ? "Connect Mock Wallet" : "Connect Wallet"}
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Mode indicator */}
            <p className="text-xs text-center text-pink-400/60">
              {mode === "mock"
                ? "Switch to Real mode in Settings to connect actual wallets"
                : "Using real Solana wallet adapters"}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
