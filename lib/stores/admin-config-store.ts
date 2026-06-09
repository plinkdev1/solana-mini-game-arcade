"use client"

import { create } from "zustand"
import type { AdminConfig } from "@/lib/services/admin-config-service"
import { supabase } from "@/lib/supabase/client"

interface AdminConfigState extends AdminConfig {
  isLoading: boolean
  isSaving: boolean
  error: string | null
  setNetwork: (network: "devnet" | "mainnet") => Promise<void>
  setMockModeOverride: (override: boolean) => Promise<void>
  setHighRollerMinHold: (amount: number) => Promise<void>
  loadConfig: (config: AdminConfig) => void
}

async function broadcastAdminUpdate(type: string, value: string | number | boolean) {
  try {
    const channel = supabase.channel("admin_updates")
    await channel.send({
      type: "broadcast",
      event: "admin_change",
      payload: { type, value, timestamp: Date.now() },
    })
  } catch (err) {
    console.error("[v0] Failed to broadcast admin update:", err)
  }
}

export const useAdminConfigStore = create<AdminConfigState>((set) => ({
  network: "devnet",
  mockModeOverride: false,
  highRollerMinHold: 100,
  isLoading: false,
  isSaving: false,
  error: null,

  setNetwork: async (network) => {
    set({ isSaving: true, error: null })
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "network", value: network }),
      })
      if (!res.ok) throw new Error("Failed to update network")
      set({ network, isSaving: false })
      await broadcastAdminUpdate("network_change", network)
      // Trigger page reload to reinitialize providers
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Unknown error", isSaving: false })
    }
  },

  setMockModeOverride: async (override) => {
    set({ isSaving: true, error: null })
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "mock_mode_override", value: override.toString() }),
      })
      if (!res.ok) throw new Error("Failed to update mock mode override")
      set({ mockModeOverride: override, isSaving: false })
      await broadcastAdminUpdate("mock_mode_change", override)
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Unknown error", isSaving: false })
    }
  },

  setHighRollerMinHold: async (amount) => {
    set({ isSaving: true, error: null })
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "high_roller_min_hold", value: amount.toString() }),
      })
      if (!res.ok) throw new Error("Failed to update high roller minimum")
      set({ highRollerMinHold: amount, isSaving: false })
      await broadcastAdminUpdate("high_roller_min_change", amount)
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Unknown error", isSaving: false })
    }
  },

  loadConfig: (config) => {
    set({ ...config, isLoading: false })
  },
}))
