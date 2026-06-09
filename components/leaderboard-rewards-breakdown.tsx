"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Crown, Zap } from "lucide-react"

const REWARD_TIERS = [
  {
    rank: "Top 1",
    datxPercent: "20%",
    benefit: "Custom Legendary NFT 1-of-1 + Golden Crown",
    visual: "🥇 Flush King",
  },
  {
    rank: "Top 2–3",
    datxPercent: "10% each",
    benefit: "Rare NFT Booster + Elite Flusher Role",
    visual: "🥈 Silver Badge",
  },
  {
    rank: "Top 4–10",
    datxPercent: "5% each",
    benefit: "Rare NFT + +10% Power-Up Bonus",
    visual: "🥉 Bronze Badge",
  },
  {
    rank: "Top 11–50",
    datxPercent: "1% each",
    benefit: "Common NFT Booster + Leaderboard Highlight",
    visual: "⭐ Rising Star",
  },
  {
    rank: "Top 51–100",
    datxPercent: "0.5% each",
    benefit: "$DATX Bonus + Wall of Flush",
    visual: "📊 Contributor",
  },
]

export function LeaderboardRewardsBreakdown({ leaderboardType }: { leaderboardType: "monthly" | "all-time" }) {
  // Mock treasury pool calculation (7% of monthly rake)
  const treasuryPool = useMemo(() => {
    if (leaderboardType === "monthly") {
      return 1250 // Mock: 7% of $17,857 in monthly rake
    }
    return 45000 // Mock: lifetime treasury
  }, [leaderboardType])

  const daysUntilReset = useMemo(() => {
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const diff = Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }, [])

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-primary/20 to-accent/20 border-primary/50">
        <div className="flex items-start gap-3 mb-4">
          <Crown className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-bold text-primary mb-2">
              Rewards Breakdown – {leaderboardType === "monthly" ? "Monthly" : "All-Time"} Flush
            </h2>
            {leaderboardType === "monthly" ? (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  This Month's Treasury Pool:{" "}
                  <span className="text-accent font-bold">${treasuryPool.toLocaleString()} $DATX</span> (from 7% rake)
                </p>
                <p className="text-sm text-muted-foreground">
                  Next reset: <span className="text-accent font-bold">{daysUntilReset} days</span>
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Lifetime Treasury: <span className="text-accent font-bold">${treasuryPool.toLocaleString()} $DATX</span>
              </p>
            )}
          </div>
        </div>
      </Card>

      <Card className="bg-card border-primary/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-primary/30">
                <TableHead className="text-primary font-bold w-24">Rank</TableHead>
                <TableHead className="text-primary font-bold">$DATX Airdrop</TableHead>
                <TableHead className="text-primary font-bold">Exclusive Benefits</TableHead>
                <TableHead className="text-primary font-bold text-center">Visual Perk</TableHead>
                {leaderboardType === "monthly" && (
                  <TableHead className="text-primary font-bold text-right">Est. Amount</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {REWARD_TIERS.map((tier, idx) => {
                let estimatedAmount = 0
                if (leaderboardType === "monthly") {
                  if (idx === 0) estimatedAmount = treasuryPool * 0.2
                  else if (idx === 1) estimatedAmount = (treasuryPool * 0.1) / 2
                  else if (idx === 2) estimatedAmount = (treasuryPool * 0.05) / 7
                  else if (idx === 3) estimatedAmount = (treasuryPool * 0.01) / 40
                  else if (idx === 4) estimatedAmount = (treasuryPool * 0.005) / 50
                }

                return (
                  <TableRow key={idx} className="border-primary/20 hover:bg-primary/5">
                    <TableCell
                      className={`font-bold ${idx === 0 ? "text-yellow-400" : idx <= 1 ? "text-gray-300" : "text-orange-600"}`}
                    >
                      {tier.rank}
                    </TableCell>
                    <TableCell className="text-accent font-semibold">{tier.datxPercent}</TableCell>
                    <TableCell className="text-sm">{tier.benefit}</TableCell>
                    <TableCell className="text-center">{tier.visual}</TableCell>
                    {leaderboardType === "monthly" && (
                      <TableCell className="text-right font-bold text-cyan-400">
                        ~${estimatedAmount.toFixed(0)}
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className="p-4 bg-cyan-900/20 border-cyan-400/50">
        <div className="flex gap-2 items-start">
          <Zap className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-cyan-300">
            <strong>Treasury Transparency:</strong> 7% rake from all game pots → Leaderboard airdrops. 20% held for
            ecosystem growth. Public wallet visible on dashboard.
          </p>
        </div>
      </Card>
    </div>
  )
}
