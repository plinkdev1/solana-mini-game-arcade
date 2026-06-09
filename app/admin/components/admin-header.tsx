"use client"

import { useAdminStore } from "@/lib/stores/admin-store"
import { useWalletStore } from "@/lib/stores/wallet-store"
import { ShieldCheck, Wifi, Clock } from "lucide-react"

export function AdminHeader() {
  const { isAdmin, authToken } = useAdminStore()
  const { network, mode } = useWalletStore()

  // Parse token to get expiry
  let expiryTime: Date | null = null
  try {
    if (authToken) {
      const decoded = JSON.parse(atob(authToken))
      expiryTime = new Date(decoded.exp)
    }
  } catch {
    // Invalid token format
  }

  const timeRemaining = expiryTime ? Math.max(0, Math.floor((expiryTime.getTime() - Date.now()) / 60000)) : 0

  return (
    <header className="h-14 border-b border-pink-500/20 bg-black/50 backdrop-blur-sm px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-amber-700">
          El Shito Admin Flush
        </h1>

        {isAdmin && (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500/20 to-amber-700/20 border border-pink-500/40"
            style={{
              boxShadow: "0 0 15px rgba(236, 72, 153, 0.3), inset 0 0 10px rgba(236, 72, 153, 0.1)",
              animation: "pulse 2s ease-in-out infinite",
            }}
          >
            <ShieldCheck className="h-4 w-4 text-pink-400" />
            <span className="text-sm font-bold text-pink-400">Admin Mode Active</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Network indicator */}
        <div className="flex items-center gap-2 text-xs">
          <Wifi className={`h-3 w-3 ${network === "mainnet" ? "text-green-400" : "text-yellow-400"}`} />
          <span className={network === "mainnet" ? "text-green-400" : "text-yellow-400"}>
            {network === "mainnet" ? "Mainnet" : "Devnet"}
          </span>
          {mode === "mock" && <span className="text-cyan-400/60 ml-1">(Mock)</span>}
        </div>

        {/* Session timer */}
        {timeRemaining > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-cyan-400/70">
            <Clock className="h-3 w-3" />
            <span>{timeRemaining}m remaining</span>
          </div>
        )}
      </div>
    </header>
  )
}
