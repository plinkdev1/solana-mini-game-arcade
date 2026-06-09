"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useWalletStore } from "@/lib/stores/wallet-store"

/**
 * Listens for admin broadcasts via Supabase realtime channel.
 * Displays toasts to users when admin changes settings.
 * Auto-reloads on network changes for RPC switch propagation.
 */
export function AdminUpdatesListener() {
  const { toast } = useToast()
  const setNetwork = useWalletStore((state) => state.setNetwork)

  useEffect(() => {
    const channel = supabase.channel("admin_updates")

    channel
      .on("broadcast", { event: "admin_change" }, (payload) => {
        const { type, value } = payload.payload as { type: string; value: string | number | boolean }

        switch (type) {
          case "network_change":
            toast({
              title: "Network Changed",
              description: `Admin switched network to ${value}. Reloading...`,
              className: "border-neon-pink bg-neon-pink/10 text-neon-pink",
            })
            // Update local store and reload
            setNetwork(value as "devnet" | "mainnet")
            setTimeout(() => window.location.reload(), 2000)
            break

          case "mock_mode_change":
            toast({
              title: "Mock Mode Updated",
              description: value ? "Mock mode enabled by admin" : "Real wallet mode enabled by admin",
              className: "border-neon-cyan bg-neon-cyan/10 text-neon-cyan",
            })
            break

          case "high_roller_min_change":
            toast({
              title: "High Roller Update",
              description: `Minimum hold changed to ${value} DATX`,
              className: "border-neon-lime bg-neon-lime/10 text-neon-lime",
            })
            break

          default:
            toast({
              title: "Admin Update",
              description: `Configuration changed: ${type}`,
            })
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [toast, setNetwork])

  return null // This is a listener-only component
}
