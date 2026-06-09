"use client"

import { useState } from "react"
import Header from "@/components/header"
import { LeaderboardHero } from "@/components/leaderboard-hero"
import { LeaderboardTable } from "@/components/leaderboard-table"
import { LeaderboardRewardsBreakdown } from "@/components/leaderboard-rewards-breakdown"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export default function LeaderboardPage() {
  const [leaderboardType, setLeaderboardType] = useState<"monthly" | "all-time">("monthly")

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
      <div className="fixed inset-0 -z-10 bg-red-900/80 backdrop-blur-sm top-20" />

      <div className="relative z-10 flex-1 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <LeaderboardHero />

          <div className="mt-8 flex justify-center">
            <ToggleGroup
              type="single"
              value={leaderboardType}
              onValueChange={(v) => v && setLeaderboardType(v as "monthly" | "all-time")}
            >
              <ToggleGroupItem value="monthly" className="data-[state=on]:bg-primary/50 data-[state=on]:text-primary">
                📅 This Month
              </ToggleGroupItem>
              <ToggleGroupItem value="all-time" className="data-[state=on]:bg-primary/50 data-[state=on]:text-primary">
                ⚔️ All-Time
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <LeaderboardRewardsBreakdown leaderboardType={leaderboardType} />
          <div className="mt-8">
            <LeaderboardTable leaderboardType={leaderboardType} />
          </div>
        </div>
      </div>
    </main>
  )
}
