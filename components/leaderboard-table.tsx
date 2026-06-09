"use client"

import { useState, useMemo, useEffect } from "react"
import { useBettingStore } from "@/lib/stores/betting-store"
import { useWalletStore } from "@/lib/stores/wallet-store"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { claimMonthlyRewards, getPlayerRewardsClaim } from "@/lib/supabase/rewards-claim-service"
import { useToast } from "@/hooks/use-toast"

const ITEMS_PER_PAGE = 25

const GAME_TYPES = [
  { value: "all", label: "All Games" },
  { value: "tic-tac-toe", label: "Poop-Tac-Toe" },
  { value: "checkers", label: "Checker Diarrhea" },
  { value: "gomoku", label: "Gomoku Sludge" },
  { value: "dots-and-boxes", label: "Dots & Feces" },
  { value: "halma", label: "Halma Hell" },
  { value: "nine-mens-morris", label: "Nine Shit Morris" },
  { value: "bubble-shooter", label: "Bubble Flush" },
  { value: "chess", label: "Royal Flush" },
  { value: "backgammon", label: "Backgammon Bluff" },
  { value: "dominoes", label: "Domino Drain" },
  { value: "peg-solitaire", label: "Peg Plunge" },
  { value: "battleship", label: "Battle Breach" },
  { value: "ludo", label: "Ludo Leak" },
  { value: "go", label: "Go with the Flow" },
  { value: "scrabble", label: "Scrabble Sludge" },
  { value: "ticket-to-ride", label: "Transit Trench" },
  { value: "risk", label: "Risk the Rats" },
  { value: "poker", label: "Poker Pit" },
  { value: "rummy", label: "Rummy Rush" },
  { value: "uno", label: "Uno Underground" },
]

function getRewardTier(rank: number) {
  if (rank === 1) return { tier: "Legendary", datxPercent: 20, icon: "🥇", color: "text-yellow-400" }
  if (rank <= 3) return { tier: "Rare", datxPercent: 10, icon: "🥈", color: "text-gray-300" }
  if (rank <= 10) return { tier: "Rare", datxPercent: 5, icon: "🥉", color: "text-orange-600" }
  if (rank <= 50) return { tier: "Common", datxPercent: 1, icon: "⭐", color: "text-cyan-400" }
  if (rank <= 100) return { tier: "Common", datxPercent: 0.5, icon: "📊", color: "text-green-400" }
  return { tier: "None", datxPercent: 0, icon: "○", color: "text-muted-foreground" }
}

export function LeaderboardTable({ leaderboardType }: { leaderboardType: "monthly" | "all-time" }) {
  const { leaderboard, isHydrated } = useBettingStore()
  const { walletAddress } = useWalletStore()
  const [currentPage, setCurrentPage] = useState(1)
  const [gameFilter, setGameFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"wins" | "earnings">("wins")

  const [playerRewardsClaim, setPlayerRewardsClaim] = useState<any>(null)
  const [isClaiming, setIsClaiming] = useState(false)
  const { toast } = useToast()

  const filteredAndSortedLeaderboard = useMemo(() => {
    let filtered = leaderboard
    if (gameFilter !== "all") {
      filtered = leaderboard.filter((player) => player.gameType === gameFilter)
    }

    let sorted = [...filtered].sort((a, b) => {
      if (sortBy === "earnings") {
        return b.totalEarnings - a.totalEarnings
      }
      return b.wins - a.wins
    })

    if (searchTerm) {
      sorted = sorted.filter((player) => player.address.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    return sorted.slice(0, 100) // Top 100 only
  }, [leaderboard, gameFilter, sortBy, searchTerm])

  const totalPages = Math.ceil(filteredAndSortedLeaderboard.length / ITEMS_PER_PAGE)
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedData = filteredAndSortedLeaderboard.slice(startIdx, startIdx + ITEMS_PER_PAGE)

  // Find current player's rank
  const playerRank = filteredAndSortedLeaderboard.findIndex(
    (p) => p.address.toLowerCase() === walletAddress?.toLowerCase(),
  )

  const playerRewards = playerRank >= 0 ? getRewardTier(playerRank + 1) : null

  useEffect(() => {
    if (walletAddress && leaderboardType === "monthly") {
      getPlayerRewardsClaim(walletAddress)
        .then((claim) => setPlayerRewardsClaim(claim))
        .catch(() => setPlayerRewardsClaim(null))
    }
  }, [walletAddress, leaderboardType])

  const handleClaimRewards = async () => {
    if (!walletAddress || playerRank < 0 || !playerRewards) return

    setIsClaiming(true)
    try {
      const estimatedAmount = calculateEstimatedAmount(playerRank + 1)
      await claimMonthlyRewards(walletAddress, estimatedAmount, playerRewards.tier)

      toast({
        title: "Flush Success!",
        description: `${estimatedAmount.toFixed(2)} $DATX + ${playerRewards.tier} NFT Airdropped!`,
        duration: 5000,
      })

      setPlayerRewardsClaim({
        claimed: true,
        amount: estimatedAmount,
        nft_type: playerRewards.tier,
      })
    } catch (error) {
      toast({
        title: "Claim Failed",
        description: "Error claiming rewards. Try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsClaiming(false)
    }
  }

  const calculateEstimatedAmount = (rank: number) => {
    const treasuryPool = 1250
    if (rank === 1) return treasuryPool * 0.2
    if (rank <= 3) return (treasuryPool * 0.1) / 2
    if (rank <= 10) return (treasuryPool * 0.05) / 7
    if (rank <= 50) return (treasuryPool * 0.01) / 40
    if (rank <= 100) return (treasuryPool * 0.005) / 50
    return 0
  }

  if (!isHydrated) {
    return (
      <Card className="p-8 bg-card border-primary/50 text-center">
        <p className="text-muted-foreground">Loading leaderboard...</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center text-sm text-muted-foreground">
        {leaderboardType === "monthly" ? "📅 Current Month Rankings" : "⚔️ All-Time Rankings"}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
        <Input
          placeholder="Search wallet address..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          className="flex-1 bg-background border-primary/30"
        />
        <Select
          value={gameFilter}
          onValueChange={(v) => {
            setGameFilter(v)
            setCurrentPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-56 bg-background border-primary/30">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-primary/50 max-h-64">
            {GAME_TYPES.map((game) => (
              <SelectItem key={game.value} value={game.value}>
                {game.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as "wins" | "earnings")}>
          <SelectTrigger className="w-full sm:w-40 bg-background border-primary/30">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-primary/50">
            <SelectItem value="wins">Sort by Wins</SelectItem>
            <SelectItem value="earnings">Sort by Earnings</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {walletAddress && playerRank >= 0 && playerRewards && (
        <Card
          className={`p-4 ${playerRank === 0 ? "bg-yellow-900/30 border-yellow-400/50" : playerRank <= 2 ? "bg-primary/10 border-primary/50" : "bg-cyan-900/20 border-cyan-400/50"}`}
        >
          <p className="text-sm text-muted-foreground mb-1">
            Your Rank:{" "}
            <span className={`font-bold text-lg ${playerRewards.color}`}>
              #{playerRank + 1} {playerRewards.icon}
            </span>
          </p>
          <p className="text-sm mb-3">
            This Month:{" "}
            <span className="text-accent font-bold">${(playerRewards.datxPercent * 100).toFixed(0)} $DATX Airdrop</span>{" "}
            + <span className="text-cyan-400 font-bold">{playerRewards.tier} NFT Reward</span>
          </p>

          <div className="flex items-center gap-3">
            {playerRewardsClaim?.claimed ? (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <span>✓</span>
                <span>Claimed: ${playerRewardsClaim.amount.toFixed(2)} $DATX</span>
              </div>
            ) : (
              <Button
                onClick={handleClaimRewards}
                disabled={isClaiming}
                size="sm"
                className="bg-primary/80 hover:bg-primary text-white"
              >
                {isClaiming ? "Claiming..." : "Claim Monthly Rewards"}
              </Button>
            )}
          </div>
        </Card>
      )}

      <Card className="bg-card border-primary/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-primary/30">
                <TableHead className="text-primary font-bold w-12">Rank</TableHead>
                <TableHead className="text-primary font-bold">Wallet</TableHead>
                <TableHead className="text-primary font-bold text-center">Wins</TableHead>
                <TableHead className="text-primary font-bold text-center">Losses</TableHead>
                <TableHead className="text-primary font-bold text-center">Win %</TableHead>
                <TableHead className="text-primary font-bold text-right">$DATX Net</TableHead>
                <TableHead className="text-primary font-bold text-center">Rewards</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No players yet. Start betting to appear on leaderboard!
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((player, idx) => {
                  const totalGames = player.wins + player.losses
                  const winRate = totalGames > 0 ? ((player.wins / totalGames) * 100).toFixed(1) : "0.0"
                  const isCurrentPlayer = player.address.toLowerCase() === walletAddress?.toLowerCase()
                  const rank = startIdx + idx + 1
                  const reward = getRewardTier(rank)

                  return (
                    <TableRow
                      key={player.address}
                      className={`border-primary/20 hover:bg-primary/5 transition-colors ${
                        isCurrentPlayer ? "bg-primary/10 border-primary/50" : rank <= 3 ? "bg-primary/5" : ""
                      }`}
                    >
                      <TableCell className={`font-bold ${reward.color}`}>
                        {reward.icon} #{rank}
                      </TableCell>
                      <TableCell className="font-mono text-accent text-sm">
                        {player.address.slice(0, 8)}...{player.address.slice(-4)}
                      </TableCell>
                      <TableCell className="text-center text-green-400 font-semibold">{player.wins}</TableCell>
                      <TableCell className="text-center text-red-400 font-semibold">{player.losses}</TableCell>
                      <TableCell className="text-center font-semibold">{winRate}%</TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        ${player.totalEarnings.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs font-bold text-cyan-400">{reward.datxPercent}%</span>
                          <span className="text-xs text-muted-foreground">{reward.tier}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="border-primary/50 hover:bg-primary/10"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="border-primary/50 hover:bg-primary/10"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
