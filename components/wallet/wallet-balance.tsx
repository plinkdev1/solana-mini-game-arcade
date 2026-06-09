"use client"

import { useEffect, useState } from "react"
import { useWalletStore } from "@/lib/stores/wallet-store"
import { Button } from "@/components/ui/button"

export function WalletBalance() {
  const { solBalance, datxBalance, mode, isFetchingBalance, setFetchingBalance } = useWalletStore()
  const [isMounted, setIsMounted] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setFetchingBalance(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setFetchingBalance(false)
    setIsRefreshing(false)
  }

  if (!isMounted) return null

  if (mode === "mock") {
    return (
      <div className="flex items-center gap-4">
        <div className={`text-sm font-mono transition-all duration-300 ${isRefreshing ? "scale-105" : "scale-100"}`}>
          <span className="text-green-400 glow-green">Mock Wallet: {datxBalance.toFixed(2)} $DATX</span>
        </div>
        <Button
          onClick={handleRefresh}
          size="sm"
          disabled={isFetchingBalance}
          className={`bg-green-600/20 hover:bg-green-600/40 border border-green-400 text-green-300 transition-all ${
            isRefreshing ? "animate-pulse shadow-lg shadow-green-400/50" : ""
          }`}
        >
          {isFetchingBalance ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <div className={`text-sm font-mono transition-all duration-300 ${isRefreshing ? "scale-105" : "scale-100"}`}>
        <span className="text-cyan-400 glow-cyan">SOL: {solBalance.toFixed(4)}</span>
        <span className="text-pink-400 glow-pink ml-4">$DATX: {datxBalance.toFixed(2)}</span>
      </div>
      <Button
        onClick={handleRefresh}
        size="sm"
        disabled={isFetchingBalance}
        className={`bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-400 text-cyan-300 transition-all ${
          isRefreshing ? "animate-pulse shadow-lg shadow-cyan-400/50" : ""
        }`}
      >
        {isFetchingBalance ? "Refreshing..." : "Refresh"}
      </Button>
    </div>
  )
}
