"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, Crown } from "lucide-react"
import { useWalletStore } from "@/lib/stores/wallet-store"
import HighRollerWarningModal from "./high-roller-warning-modal"

interface BetFilterModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: (bet: number, highRoller?: boolean) => void
}

export default function BetFilterModal({ open, onOpenChange, onApply }: BetFilterModalProps) {
  const [betAmount, setBetAmount] = useState("0.01")
  const [showWarning, setShowWarning] = useState(false)
  const [highRollerMode, setHighRollerMode] = useState(false)
  const [showHighRollerWarning, setShowHighRollerWarning] = useState(false)
  const { datxBalance } = useWalletStore()

  const handleHighRollerToggle = (checked: boolean) => {
    if (checked) {
      if (datxBalance < 1) {
        setShowWarning(true)
        setHighRollerMode(false)
        return
      }
      setShowHighRollerWarning(true)
      setHighRollerMode(true)
    } else {
      setHighRollerMode(false)
    }
  }

  const handleApply = () => {
    const amount = Number.parseFloat(betAmount)
    if (amount > 0.5) {
      setShowWarning(true)
    } else {
      onApply(amount, highRollerMode)
      onOpenChange(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="border-cyan-500/30 bg-background/95 backdrop-blur">
          <DialogHeader>
            <DialogTitle className="text-cyan-400">Select Bet Amount</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Choose how much $DATX you want to wager
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-accent">Bet Size ($DATX)</label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                max="10"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="mt-2 border-green-500/30 bg-green-500/5"
                placeholder="0.01"
              />
            </div>

            {showWarning && (
              <div className="flex gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-bold text-amber-400 mb-1">High Bet Warning</p>
                  <p className="text-muted-foreground">
                    This is for fun/entertainment only. Age 18+. Play responsibly. Bets are currently simulated/mock for
                    testing.
                  </p>
                </div>
              </div>
            )}

            <div className="p-3 border border-purple-500/20 rounded-lg bg-purple-500/5">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="high-roller"
                  checked={highRollerMode}
                  onCheckedChange={handleHighRollerToggle}
                  className="border-purple-500"
                />
                <div className="flex-1">
                  <label
                    htmlFor="high-roller"
                    className="text-sm font-bold text-purple-400 cursor-pointer flex items-center gap-1"
                  >
                    <Crown className="w-4 h-4" />
                    High Roller Mode
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Requires {">"}1 $DATX balance (yours: {datxBalance.toFixed(2)})
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 border-cyan-500/30 text-cyan-400"
              >
                Cancel
              </Button>
              <Button onClick={handleApply} className="flex-1 bg-green-600 hover:bg-green-700 text-black font-bold">
                Apply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <HighRollerWarningModal
        open={showHighRollerWarning}
        onOpenChange={setShowHighRollerWarning}
        onConfirm={() => {
          setShowHighRollerWarning(false)
        }}
      />
    </>
  )
}
