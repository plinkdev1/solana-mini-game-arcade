"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, HeartHandshake } from "lucide-react"

interface HighRollerWarningModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export default function HighRollerWarningModal({ open, onOpenChange, onConfirm }: HighRollerWarningModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-amber-500/30 bg-background/95 backdrop-blur max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <DialogTitle className="text-amber-400">High Roller Rooms</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Token-gated access for elevated stakes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Access requirement */}
          <div className="p-3 border border-amber-500/20 rounded-lg bg-amber-500/5">
            <p className="text-sm font-bold text-amber-400 mb-1">📊 Minimum Balance Required</p>
            <p className="text-sm text-muted-foreground">Hold more than 1 $DATX to access high roller games</p>
          </div>

          {/* Responsible play warning */}
          <div className="space-y-2">
            <p className="text-sm font-bold text-amber-400">⚠️ Responsible Play Notice</p>
            <div className="text-xs text-muted-foreground space-y-1 bg-amber-500/5 p-3 rounded border border-amber-500/20">
              <p>• For entertainment purposes only – not real money</p>
              <p>• Must be 18+ to play</p>
              <p>• Play responsibly and within your means</p>
              <p>• Bets are currently simulated for testing</p>
            </div>
          </div>

          {/* Help resources */}
          <div className="p-3 border border-green-500/20 rounded-lg bg-green-500/5">
            <div className="flex items-start gap-2">
              <HeartHandshake className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-green-400 mb-1">Need Help?</p>
                <p className="text-xs text-muted-foreground">
                  If gaming feels compulsive, seek support at{" "}
                  <a
                    href="https://www.ncpg.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:underline"
                  >
                    NCPG.org
                  </a>
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
            <Button onClick={onConfirm} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold">
              I Understand, Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
