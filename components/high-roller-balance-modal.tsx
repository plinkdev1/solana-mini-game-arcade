"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface HighRollerBalanceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentBalance: number
  requiredBalance: number
}

export default function HighRollerBalanceModal({
  open,
  onOpenChange,
  currentBalance,
  requiredBalance,
}: HighRollerBalanceModalProps) {
  const { toast } = useToast()
  const isEligible = currentBalance >= requiredBalance

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-amber-500/30 bg-background">
        <DialogHeader>
          <DialogTitle className="text-amber-400 text-2xl">👑 High Roller Mode</DialogTitle>
          <DialogDescription className="text-muted-foreground mt-4">
            <div className="space-y-4">
              <p>Bets exceeding 0.1 $DATX require token holding verification.</p>

              {/* Balance Check */}
              <div
                className={`border rounded-lg p-4 ${isEligible ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"}`}
              >
                <p className="text-sm font-bold mb-2">💰 Token Hold Requirement</p>
                <p className="text-xs">
                  Your Balance: <span className="font-bold text-cyan-400">{currentBalance.toFixed(2)} $DATX</span>
                </p>
                <p className="text-xs">
                  Required: <span className="font-bold text-amber-400">{requiredBalance} $DATX</span>
                </p>
                <p className={`text-xs mt-2 font-bold ${isEligible ? "text-green-400" : "text-red-400"}`}>
                  {isEligible ? "✓ Eligible" : "✗ Insufficient Balance"}
                </p>
              </div>

              {/* Compliance Warning */}
              <div className="border border-amber-500/30 rounded-lg p-4 bg-amber-500/5 space-y-2 text-xs">
                <p className="font-bold text-amber-400">⚠️ Important Disclosures:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>For entertainment purposes only – not gambling or financial instruments</li>
                  <li>Age 18+ required to participate</li>
                  <li>Play responsibly – set limits and take breaks</li>
                  <li>
                    Risk of addiction – seek help at <span className="text-cyan-400">ncpg.org</span> or{" "}
                    <span className="text-cyan-400">gamblersanonymous.org</span>
                  </li>
                  <li>All bets currently simulated/mock for MVP testing</li>
                </ul>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1 bg-transparent" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!isEligible}
            className={`flex-1 font-bold ${isEligible ? "bg-amber-600 hover:bg-amber-700" : "bg-gray-600 cursor-not-allowed"}`}
            onClick={() => {
              if (isEligible) {
                toast({
                  title: "High Roller Mode Enabled",
                  description: "Ready to bet big!",
                })
                onOpenChange(false)
              }
            }}
          >
            {isEligible ? "Enter High Roller Mode" : "Insufficient Balance"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
