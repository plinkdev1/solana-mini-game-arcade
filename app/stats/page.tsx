"use client"

import Header from "@/components/header"
import { StatsHero } from "@/components/stats-hero"
import { StatsCards } from "@/components/stats-cards"
import { GameHistoryTable } from "@/components/game-history-table"
import { useBettingStore } from "@/lib/stores/betting-store"
import { useEffect, useState } from "react"

export default function StatsPage() {
  const [isHydrated, setIsHydrated] = useState(false)
  const { isHydrated: storeHydrated } = useBettingStore()

  useEffect(() => {
    setIsHydrated(storeHydrated)
  }, [storeHydrated])

  if (!isHydrated) {
    return (
      <main className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading your stats...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header />

      <div
        className="fixed inset-0 -z-10 top-20"
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(233, 30, 99, 0.15) 0%, transparent 40%),
            radial-gradient(ellipse at 80% 80%, rgba(0, 255, 65, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 0%, rgba(255, 0, 255, 0.1) 0%, transparent 60%),
            linear-gradient(135deg, #1a0f1a 0%, #0a0a0a 50%, #0f1a0a 100%)
          `,
        }}
      />

      <div className="relative z-10 flex-1 py-12 px-6">
        <StatsHero />
        <div className="max-w-6xl mx-auto">
          <StatsCards />
          <GameHistoryTable />
        </div>
      </div>
    </main>
  )
}
