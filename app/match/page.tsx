"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import MatchmakingHero from "@/components/matchmaking-hero"
import MatchmakingBoard from "@/components/matchmaking-board"
import BetFilterModal from "@/components/bet-filter-modal"
import FirstBetDisclaimerModal from "@/components/first-bet-disclaimer-modal"
import RoomSelectorTabs from "@/components/room-selector-tabs"
import HighRollerBalanceModal from "@/components/high-roller-balance-modal"
import { Button } from "@/components/ui/button"
import { useMatchesStore } from "@/lib/stores/matches-store"
import {
  checkHighRollerEligibility,
  getHighRollerBalance,
  getHighRollerMinHold,
} from "@/lib/supabase/high-roller-gating-service"

export default function MatchmakingPage() {
  const [filterOpen, setFilterOpen] = useState(false)
  const [disclaimerOpen, setDisclaimerOpen] = useState(false)
  const [firstBetShown, setFirstBetShown] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<"normal" | "high_roller">("normal")
  const [canAccessHighRoller, setCanAccessHighRoller] = useState(false)
  const [balanceCheckOpen, setBalanceCheckOpen] = useState(false)
  const [userBalance, setUserBalance] = useState(0)
  const [minHold, setMinHold] = useState(100)

  const {
    selectedBetAmount,
    setBetAmount,
    isSearching,
    setSearching,
    highRollerMode,
    setHighRollerMode,
    getGamesRemaining,
  } = useMatchesStore()

  useEffect(() => {
    const checkEligibility = async () => {
      const mockWallet = "wallet_123" // Mock wallet - get from context later
      const eligible = await checkHighRollerEligibility(mockWallet)
      const balance = await getHighRollerBalance(mockWallet)
      const hold = await getHighRollerMinHold(mockWallet)
      setCanAccessHighRoller(eligible)
      setUserBalance(balance)
      setMinHold(hold)
    }
    checkEligibility()

    const hasSeenDisclaimer = localStorage.getItem("sewer-arena-disclaimer-shown")
    if (!hasSeenDisclaimer) {
      setDisclaimerOpen(true)
      setFirstBetShown(true)
    }
  }, [])

  const handleRandomQueue = () => {
    const gamesRemaining = getGamesRemaining()
    if (gamesRemaining <= 0) {
      // Show rate limit warning
      alert("You've reached the 5 games/hour limit. Try again later!")
      return
    }
    setFilterOpen(true)
  }

  const handleApplyBet = (bet: number, highRoller?: boolean) => {
    setBetAmount(bet)
    setSearching(true)
  }

  const handleDisclaimerAccept = () => {
    localStorage.setItem("sewer-arena-disclaimer-shown", "true")
    setDisclaimerOpen(false)
  }

  const handleRoomChange = (room: "normal" | "high_roller") => {
    setSelectedRoom(room)
    if (room === "high_roller" && !canAccessHighRoller) {
      setBalanceCheckOpen(true)
    } else if (room === "high_roller") {
      setHighRollerMode(true)
    } else {
      setHighRollerMode(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header />

      <div
        className="fixed inset-0 -z-10 top-20"
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(34, 211, 238, 0.15) 0%, transparent 40%),
            radial-gradient(ellipse at 80% 80%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
            linear-gradient(135deg, #0a0f1a 0%, #0a0a0a 50%, #0a1a0f 100%)
          `,
        }}
      />
      <div className="fixed inset-0 -z-10 bg-cyan-900/40 backdrop-blur-sm top-20" />

      <div className="relative z-10 flex-1 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <MatchmakingHero />

          <RoomSelectorTabs
            selectedRoom={selectedRoom}
            onRoomChange={handleRoomChange}
            canAccessHighRoller={canAccessHighRoller}
          />

          <div className="mt-12 grid md:grid-cols-3 gap-8">
            {/* Open Games Board */}
            <div className="md:col-span-2">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-cyan-400 mb-2">🎮 Open Matches</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedRoom === "normal" ? "Browse normal bet games" : "Browse high roller matches"}
                </p>
              </div>
              <MatchmakingBoard highRollerMode={selectedRoom === "high_roller"} />
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <div className="border border-green-500/30 rounded-lg p-6 bg-green-500/5">
                <h3 className="text-xl font-bold text-green-400 mb-4">⚡ Quick Play</h3>

                {isSearching ? (
                  <div className="text-center">
                    <div className="animate-spin text-2xl mb-4">🌪️</div>
                    <p className="text-sm text-muted-foreground mb-4">Searching for opponent...</p>
                    <Button
                      onClick={() => setSearching(false)}
                      variant="outline"
                      className="w-full border-amber-500/30 text-amber-400"
                    >
                      Cancel Search
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-2">
                      Current bet:{" "}
                      <span className="font-bold text-green-400">{selectedBetAmount.toFixed(2)} $DATX</span>
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Games remaining: <span className="font-bold text-cyan-400">{getGamesRemaining()}/5 per hour</span>
                    </p>
                    {highRollerMode && (
                      <p className="text-xs text-amber-400 mb-2 font-bold">👑 High Roller Mode Active</p>
                    )}
                    <Button
                      onClick={handleRandomQueue}
                      className="w-full bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 text-black font-bold mb-3"
                      style={{ boxShadow: "0 0 15px rgba(34, 197, 94, 0.3)" }}
                    >
                      Join Random Queue
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-cyan-500/30 text-cyan-400 text-xs bg-transparent"
                      onClick={() => setFilterOpen(true)}
                    >
                      Change Bet Size
                    </Button>
                  </>
                )}
              </div>

              {/* Info Card */}
              <div className="border border-cyan-500/20 rounded-lg p-4 bg-cyan-500/5 text-xs text-muted-foreground space-y-2">
                <p>
                  <span className="text-cyan-400 font-bold">💡 Tip:</span> Join the queue to match with random players
                </p>
                <p>
                  <span className="text-cyan-400 font-bold">⚠️ Note:</span> All bets currently simulated for MVP testing
                </p>
                <p>
                  <span className="text-cyan-400 font-bold">⏱️ Limit:</span> 5 games per hour per wallet
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BetFilterModal open={filterOpen} onOpenChange={setFilterOpen} onApply={handleApplyBet} />
      <FirstBetDisclaimerModal
        open={disclaimerOpen}
        onOpenChange={setDisclaimerOpen}
        onAccept={handleDisclaimerAccept}
      />
      <HighRollerBalanceModal
        open={balanceCheckOpen}
        onOpenChange={setBalanceCheckOpen}
        currentBalance={userBalance}
        requiredBalance={minHold}
      />
    </main>
  )
}
