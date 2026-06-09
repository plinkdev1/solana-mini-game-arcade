"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { checkHighRollerEligibility, type HighRollerEligibility } from "@/lib/supabase/high-roller-gating-service"

interface HighRollerEligibilityCheckProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPass: () => void
}

export default function HighRollerEligibilityCheck({ open, onOpenChange, onPass }: HighRollerEligibilityCheckProps) {
  const [checking, setChecking] = useState(false)
  const [eligibility, setEligibility] = useState<HighRollerEligibility | null>(null)
  const { toast } = useToast()
  const mockWallet = "wallet_123" // Mock wallet - get from context later

  const handleCheck = async () => {
    setChecking(true)
    try {
      const result = await checkHighRollerEligibility(mockWallet)
      setEligibility(result)

      if (result.eligible) {
        toast({
          title: "El Shito's Blessing!",
          description: `You are eligible! +${result.nftRarity === "legendary" ? "10" : result.nftRarity === "rare" ? "5" : "0"}% power-up bonus`,
          className: "neon-green",
        })
        onPass()
        onOpenChange(false)
      } else {
        const reasons = result.reasons.join(" • ")
        toast({
          title: "Insufficient Flush Power",
          description: reasons,
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to check eligibility",
        variant: "destructive",
      })
    } finally {
      setChecking(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-black/90 backdrop-blur border-2 border-red-500/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            High Roller Check
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Verify your eligibility to enter the high roller room
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2 text-sm text-gray-300">
            <p className="font-semibold text-accent">Requirements:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{`${eligibility?.minHold || 100} $DATX balance`}</li>
              <li>Sewer Rebels NFT holding</li>
              <li>Max 3 games per hour</li>
            </ul>
          </div>

          {eligibility && !eligibility.eligible && (
            <div className="bg-red-900/30 border-l-2 border-red-500 pl-3 py-2 rounded">
              <p className="text-red-300 text-xs font-mono space-y-1">
                {eligibility.reasons.map((r, i) => (
                  <div key={i}>{r}</div>
                ))}
              </p>
            </div>
          )}

          <Button
            onClick={handleCheck}
            disabled={checking}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold"
          >
            {checking ? "Checking..." : "Enter High Roller Room"}
          </Button>

          <div className="bg-orange-900/20 border border-orange-500/30 rounded p-3 text-xs text-orange-300">
            <p className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Age 18+</strong> • For entertainment only • Bets are simulated/mock • Addiction risks exist •
                Need help?{" "}
                <a
                  href="https://www.ncpg.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-yellow-300"
                >
                  NCPG
                </a>
              </span>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
