"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Crown } from "lucide-react"
import Link from "next/link"
import MatchmakingBoard from "./matchmaking-board"
import HighRollerEligibilityCheck from "./high-roller-eligibility-check"
import HighRollerWarningModal from "./high-roller-warning-modal"
import CaptchaVerificationModal from "./captcha-verification-modal"
import { checkAntiSybilRequirements } from "@/lib/supabase/anti-sybil-service"
import { checkGameRateLimit } from "@/lib/supabase/rate-limiting-service"
import { useLowBalanceCheck, LowBalanceWarningBanner } from "./wallet/low-balance-warning"
import { BET_CONFIG, validateBetAmount, shouldShowHighRollerWarning, getRoomTypeForBet } from "@/lib/config/bet-config"
import { Slider } from "@/components/ui/slider"
import { getDatexPrice, formatDatxPrice } from "@/lib/services/price-oracle"
import { useToast } from "@/hooks/use-toast"
import { useBettingStore } from "@/lib/stores/betting-store"

interface BetAndRoomSelectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  game: {
    slug: string
    playerCount: number
  }
  walletAddress?: string
}

export default function BetAndRoomSelectionModal({
  open,
  onOpenChange,
  game,
  walletAddress = "mock-wallet",
}: BetAndRoomSelectionModalProps) {
  const [selectedRoom, setSelectedRoom] = useState<"normal" | "high_roller">("normal")
  const [betAmount, setBetAmount] = useState("1")
  const [showHighRollerWarning, setShowHighRollerWarning] = useState(false)
  const [eligibilityCheckOpen, setEligibilityCheckOpen] = useState(false)
  const [showLiveBoard, setShowLiveBoard] = useState(false)
  const [captchaOpen, setCaptchaOpen] = useState(false)
  const [rateLimitWarning, setRateLimitWarning] = useState(false)
  const [antiSybilStatus, setAntiSybilStatus] = useState<any>(null)
  const [betError, setBetError] = useState<string | null>(null)
  const [showCompliance, setShowCompliance] = useState(false)
  const [datxPrice, setDatxPrice] = useState<string>("$0.0001")
  const [isConfirming, setIsConfirming] = useState(false)
  const { toast } = useToast()
  const { addGameToHistory } = useBettingStore.getState()

  useEffect(() => {
    getDatexPrice().then((priceData) => {
      setDatxPrice(formatDatxPrice(priceData.price))
    })
  }, [])

  const { isBetDisabled } = useLowBalanceCheck(Number.parseFloat(betAmount))

  const gameRoutes: Record<string, string> = {
    "tic-tac-toe": "/poop-tac-toe",
    checkers: "/poop-checkers",
    gomoku: "/infinite-poop-gomoku",
    "dots-and-boxes": "/poop-boxes",
    halma: "/poop-halma",
    "nine-mens-morris": "/poop-mills",
    bubble: "/bubble-flush",
    chess: "/poop-chess",
    backgammon: "/backgammon-flush",
    dominoes: "/domino-clog",
    peg: "/peg-flush",
    battleship: "/battle-flush",
    ludo: "/ludo-flush",
    go: "/go-clog",
    scrabble: "/scrabble-shit",
    "ticket-to-ride": "/ticket-flush",
    risk: "/risk-clog",
    poker: "/poop-poker",
    rummy: "/rummy-clog",
    uno: "/uno-flush",
  }

  const gameLink = gameRoutes[game.slug] || "/poop-tac-toe"
  const betNum = Number.parseFloat(betAmount) || 0
  const autoRoom = getRoomTypeForBet(betNum)
  const isHighRollerBet = betNum >= BET_CONFIG.HIGH_ROLLER_ROOM.MIN_BET

  const betValidation = validateBetAmount(betNum, selectedRoom)
  const showHighRollerWarningUI = shouldShowHighRollerWarning(betNum)

  const handleBetChange = (value: string) => {
    setBetAmount(value)
    const num = Number.parseFloat(value) || 0

    const validation = validateBetAmount(num, selectedRoom)
    setBetError(validation.error || null)
  }

  const handleRoomSelect = async (room: "normal" | "high_roller") => {
    const validation = validateBetAmount(betNum, room)
    if (!validation.isValid) {
      setBetError(validation.error || null)
      return
    }

    const sybilStatus = await checkAntiSybilRequirements(walletAddress)
    const rateLimit = await checkGameRateLimit(walletAddress)

    if (!sybilStatus.canPlay) {
      setCaptchaOpen(true)
      setAntiSybilStatus(sybilStatus)
      return
    }

    if (rateLimit.isLimited) {
      setRateLimitWarning(true)
      return
    }

    if (room === "high_roller") {
      setEligibilityCheckOpen(true)
    } else {
      setSelectedRoom(room)

      if (showHighRollerWarningUI) {
        setShowHighRollerWarning(true)
      } else {
        setShowLiveBoard(true)
      }
    }
  }

  const handleHighRollerPass = () => {
    setSelectedRoom("high_roller")
    setEligibilityCheckOpen(false)
    setShowHighRollerWarning(true)
  }

  const handleConfirmBet = async () => {
    setIsConfirming(true)

    if (!showCompliance) {
      setShowCompliance(true)
      setIsConfirming(false)
      return
    }

    addGameToHistory({
      id: Date.now().toString(),
      gameType: game.slug,
      betAmount: betNum,
      result: "pending",
      timestamp: Date.now(),
      rake: betNum * 0.1,
    })

    toast({
      title: "💸 Flush Bet Confirmed!",
      description: `${betNum} DATX bet placed in ${selectedRoom} room`,
      className: "border-pink-500/50 bg-pink-500/10 animate-pulse",
    })

    setIsConfirming(false)
    await handleRoomSelect(selectedRoom)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl bg-black/90 backdrop-blur border-2 border-pink-500/50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-pink-400">Place Bet & Select Room</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Choose your room, set your stake, and find an opponent
            </DialogDescription>
          </DialogHeader>

          {!showLiveBoard && !showCompliance ? (
            <div className="space-y-6">
              <LowBalanceWarningBanner betAmount={betNum} />

              <div className="flex items-center justify-between p-2 bg-accent/5 border border-accent/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-accent">💰 DATX Price:</span>
                  <span className="text-sm text-cyan-400">{datxPrice}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Real-time balance: {Number.parseFloat(betAmount) || 0} DATX
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-accent block mb-2">💸 Bet Amount ($DATX)</label>
                <div className="space-y-3">
                  <Slider
                    value={[betNum]}
                    onValueChange={(val) => handleBetChange(val[0].toString())}
                    min={
                      selectedRoom === "normal" ? BET_CONFIG.NORMAL_ROOM.MIN_BET : BET_CONFIG.HIGH_ROLLER_ROOM.MIN_BET
                    }
                    max={
                      selectedRoom === "normal" ? BET_CONFIG.NORMAL_ROOM.MAX_BET : BET_CONFIG.HIGH_ROLLER_ROOM.SOFT_CAP
                    }
                    step={selectedRoom === "normal" ? 1 : 100}
                    className={`${selectedRoom === "normal" ? "[&>[role=slider]]:bg-green-500" : "[&>[role=slider]]:bg-red-500"}`}
                  />

                  <Input
                    type="number"
                    step={selectedRoom === "normal" ? 1 : 100}
                    min={
                      selectedRoom === "normal" ? BET_CONFIG.NORMAL_ROOM.MIN_BET : BET_CONFIG.HIGH_ROLLER_ROOM.MIN_BET
                    }
                    max={
                      selectedRoom === "normal" ? BET_CONFIG.NORMAL_ROOM.MAX_BET : BET_CONFIG.HIGH_ROLLER_ROOM.SOFT_CAP
                    }
                    value={betAmount}
                    onChange={(e) => handleBetChange(e.target.value)}
                    className={`border-2 transition ${
                      selectedRoom === "normal"
                        ? "border-green-500/50 bg-green-500/5 focus:border-green-500"
                        : "border-red-500/50 bg-red-500/5 focus:border-red-500"
                    } ${betError ? "border-red-500/80 bg-red-500/10" : ""}`}
                    placeholder={selectedRoom === "normal" ? "10" : "5000"}
                  />
                </div>

                {selectedRoom === "normal" && betNum > 0 && betNum < 5 && (
                  <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
                    <p className="text-xs text-yellow-300">⚠️ Low bets may not cover transaction fees in real mode!</p>
                  </div>
                )}

                {selectedRoom === "high_roller" && betNum >= BET_CONFIG.HIGH_ROLLER_ROOM.SOFT_CAP && (
                  <div className="mt-2 p-2 bg-red-500/10 border border-red-500/50 rounded-lg">
                    <p className="text-xs text-red-300">🔥 Ultra high bet – risks higher fees. Confirm proceed?</p>
                  </div>
                )}

                {betError && (
                  <div className="mt-2 p-2 bg-red-500/10 border border-red-500/50 rounded-lg">
                    <p className="text-xs text-red-400">❌ {betError}</p>
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-2">
                  {selectedRoom === "normal"
                    ? `Range: ${BET_CONFIG.NORMAL_ROOM.MIN_BET} - ${BET_CONFIG.NORMAL_ROOM.MAX_BET} $DATX`
                    : `Minimum: ${BET_CONFIG.HIGH_ROLLER_ROOM.MIN_BET} $DATX (soft cap: ${BET_CONFIG.HIGH_ROLLER_ROOM.SOFT_CAP})`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setSelectedRoom("normal")
                    setBetError(null)
                  }}
                  disabled={isBetDisabled}
                  className={`p-4 rounded-lg border-2 transition ${
                    isBetDisabled ? "opacity-50 cursor-not-allowed" : ""
                  } ${
                    selectedRoom === "normal" && !showLiveBoard
                      ? "border-green-500 bg-green-500/10"
                      : "border-green-500/30 hover:border-green-500/50"
                  }`}
                >
                  <p className="text-lg font-bold text-green-400 mb-1">🟢 Normal Room</p>
                  <p className="text-xs text-muted-foreground">{BET_CONFIG.NORMAL_ROOM.DESCRIPTION}</p>
                  <p className="text-xs text-green-300 mt-2">Fair play for all</p>
                </button>

                <button
                  onClick={() => {
                    setSelectedRoom("high_roller")
                    setBetError(null)
                  }}
                  className={`p-4 rounded-lg border-2 transition ${
                    selectedRoom === "high_roller" && !showLiveBoard
                      ? "border-red-500 bg-red-500/10"
                      : "border-red-500/30 hover:border-red-500/50"
                  }`}
                >
                  <p className="text-lg font-bold text-red-400 mb-1 flex items-center gap-1">
                    <Crown className="w-4 h-4" /> High Roller
                  </p>
                  <p className="text-xs text-muted-foreground">{BET_CONFIG.HIGH_ROLLER_ROOM.DESCRIPTION}</p>
                  <p className="text-xs text-red-300 mt-2">Token-gated, epic rewards</p>
                </button>
              </div>

              <Button
                onClick={handleConfirmBet}
                disabled={!betValidation.isValid || isBetDisabled || isConfirming}
                className="w-full bg-pink-500/70 hover:bg-pink-500/90 text-black font-bold h-12 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isConfirming ? "Confirming..." : "View Available Players"}
              </Button>
            </div>
          ) : showCompliance ? (
            <div className="space-y-4">
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg space-y-3">
                <p className="font-bold text-amber-300">⚠️ Responsible Gambling Notice</p>
                <p className="text-sm text-muted-foreground">
                  Bets are for entertainment only. Gambling may become addictive. Please set limits and play
                  responsibly.
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Only bet what you can afford to lose</li>
                  <li>Take regular breaks</li>
                  <li>High roller bets carry increased risk</li>
                </ul>
                <div className="pt-2 border-t border-amber-500/20 space-y-2">
                  <p className="text-xs font-bold text-amber-300">🆘 Need Help?</p>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      <Link href="https://www.ncpg.org" target="_blank" className="text-cyan-400 hover:underline">
                        NCPG Helpline (1-800-GAMBLER)
                      </Link>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <Link href="https://www.begambleaware.org" target="_blank" className="text-cyan-400 hover:underline">
                        BeGambleAware Support
                      </Link>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <Link href="https://www.gamblersanonymous.org" target="_blank" className="text-cyan-400 hover:underline">
                        Gamblers Anonymous
                      </Link>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowCompliance(false)}
                  variant="outline"
                  className="flex-1 border-accent text-accent"
                >
                  Back
                </Button>
                <Button
                  onClick={handleConfirmBet}
                  className="flex-1 bg-pink-500/70 hover:bg-pink-500/90 text-black font-bold"
                >
                  I Understand, Continue
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-accent">
                  {selectedRoom === "high_roller" ? "🔴 High Roller" : "🟢 Normal"} Players Waiting
                </p>
                <Button variant="ghost" size="sm" onClick={() => setShowLiveBoard(false)} className="text-cyan-400">
                  ← Back to Settings
                </Button>
              </div>
              <MatchmakingBoard highRollerMode={selectedRoom === "high_roller"} />

              <div className="flex gap-3">
                <Link href={`${gameLink}?bet=${betAmount}&room=${selectedRoom}`} className="flex-1">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-black font-bold">
                    Join Random Queue
                  </Button>
                </Link>
                <Button variant="outline" onClick={() => onOpenChange(false)} className="border-accent text-accent">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <HighRollerEligibilityCheck
        open={eligibilityCheckOpen}
        onOpenChange={setEligibilityCheckOpen}
        onPass={handleHighRollerPass}
      />

      <HighRollerWarningModal open={showHighRollerWarning} onOpenChange={setShowHighRollerWarning} />

      <CaptchaVerificationModal
        open={captchaOpen}
        onOpenChange={setCaptchaOpen}
        walletAddress={walletAddress}
        onVerified={() => {
          setCaptchaOpen(false)
          setShowLiveBoard(true)
        }}
      />

      <Dialog open={rateLimitWarning} onOpenChange={setRateLimitWarning}>
        <DialogContent className="border-red-500/30 bg-black/90">
          <DialogHeader>
            <DialogTitle className="text-red-400">Rate Limit Reached</DialogTitle>
            <DialogDescription>
              <p>You've reached the 10 games/hour limit. Flush responsibly!</p>
              <p className="mt-2 text-sm text-amber-300">
                Next reset: {new Date(Date.now() + 3600000).toLocaleTimeString()}
              </p>
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setRateLimitWarning(false)} className="w-full">
            OK
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
