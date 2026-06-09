"use client"

import { useEffect } from "react"
import { useAdminConfigStore } from "@/lib/stores/admin-config-store"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function AdminSettings() {
  const {
    network,
    mockModeOverride,
    highRollerMinHold,
    isSaving,
    error,
    setNetwork,
    setMockModeOverride,
    setHighRollerMinHold,
  } = useAdminConfigStore()
  const { toast } = useToast()

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/admin/config")
        if (res.ok) {
          const config = await res.json()
          useAdminConfigStore.setState(config)
        }
      } catch (err) {
        console.error("[v0] Failed to fetch admin config:", err)
      }
    }
    fetchConfig()
  }, [])

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
    }
  }, [error, toast])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-neon-pink/20 p-6">
        <h2
          className="text-3xl font-bold text-neon-pink drop-shadow-lg"
          style={{ textShadow: "0 0 10px rgba(255, 20, 147, 0.5)" }}
        >
          Global Settings
        </h2>
        <p className="text-neon-cyan/60 text-sm mt-2">Manage Sewer Arena global configuration</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl space-y-6">
          {/* Network Toggle */}
          <Card className="border-neon-pink/30 bg-neon-pink/5">
            <CardHeader>
              <CardTitle className="text-neon-pink flex items-center gap-2">🌐 Network Configuration</CardTitle>
              <CardDescription>Select the Solana network for all operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 flex-wrap">
                {(["devnet", "mainnet"] as const).map((net) => (
                  <Button
                    key={net}
                    onClick={() => setNetwork(net)}
                    variant={network === net ? "default" : "outline"}
                    className={
                      network === net
                        ? "bg-neon-pink text-black hover:bg-neon-pink/80"
                        : "border-neon-pink/30 text-neon-pink hover:bg-neon-pink/10"
                    }
                    disabled={isSaving}
                  >
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {net.charAt(0).toUpperCase() + net.slice(1)}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-neon-yellow">
                ⚠️ Changing network will reload the page in providers. Please wait...
              </p>
            </CardContent>
          </Card>

          {/* Mock Mode Override */}
          <Card className="border-neon-cyan/30 bg-neon-cyan/5">
            <CardHeader>
              <CardTitle className="text-neon-cyan flex items-center gap-2">🎭 Mock Mode Override</CardTitle>
              <CardDescription>Force all users into mock mode (bypasses user settings)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-center">
                <Button
                  onClick={() => setMockModeOverride(!mockModeOverride)}
                  variant={mockModeOverride ? "default" : "outline"}
                  className={
                    mockModeOverride
                      ? "bg-neon-cyan text-black hover:bg-neon-cyan/80"
                      : "border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
                  }
                  disabled={isSaving}
                >
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {mockModeOverride ? "Override ON" : "Override OFF"}
                </Button>
                <span className="text-sm text-neon-cyan/70">
                  Status: <span className="font-bold text-neon-cyan">{mockModeOverride ? "ENABLED" : "DISABLED"}</span>
                </span>
              </div>
              <p className="text-xs text-neon-cyan/50">When enabled, users cannot switch to real wallet mode</p>
            </CardContent>
          </Card>

          {/* High Roller Min Hold */}
          <Card className="border-neon-lime/30 bg-neon-lime/5">
            <CardHeader>
              <CardTitle className="text-neon-lime flex items-center gap-2">💎 High Roller Minimum Hold</CardTitle>
              <CardDescription>
                Minimum DATX required to access high roller rooms (and optionally NFT holding)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-center flex-wrap md:flex-nowrap">
                <div className="flex-1 min-w-48">
                  <Input
                    type="number"
                    value={highRollerMinHold}
                    onChange={(e) => {
                      const val = Number.parseInt(e.target.value)
                      if (!isNaN(val) && val > 0) {
                        useAdminConfigStore.setState({ highRollerMinHold: val })
                      }
                    }}
                    className="border-neon-lime/30 bg-neon-lime/10 text-neon-lime placeholder:text-neon-lime/50"
                    disabled={isSaving}
                    min="1"
                  />
                </div>
                <Button
                  onClick={() => setHighRollerMinHold(highRollerMinHold)}
                  className="bg-neon-lime text-black hover:bg-neon-lime/80"
                  disabled={isSaving}
                >
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save
                </Button>
              </div>
              <p className="text-xs text-neon-lime/50">
                Default: 100 DATX. Players must hold this amount + optional Sewer Rebels NFT to access high roller
                rooms.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
