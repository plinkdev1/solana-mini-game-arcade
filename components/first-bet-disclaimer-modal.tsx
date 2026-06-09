"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"

interface FirstBetDisclaimerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAccept: () => void
}

export default function FirstBetDisclaimerModal({ open, onOpenChange, onAccept }: FirstBetDisclaimerModalProps) {
  const [accepted, setAccepted] = useState(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-cyan-500/30 bg-background/95 backdrop-blur max-w-md">
        <DialogHeader>
          <DialogTitle className="text-cyan-400">📋 Sewer Arena Disclaimer</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="space-y-2 text-muted-foreground max-h-64 overflow-y-auto">
            <p className="font-bold text-cyan-400">Entertainment Purpose Only</p>
            <p>
              Sewer Arena is a mock/simulated gaming platform for entertainment. All bets and transactions are simulated
              and not real.
            </p>

            <p className="font-bold text-cyan-400 mt-3">Age Requirement</p>
            <p>You must be 18 years or older to use this platform.</p>

            <p className="font-bold text-cyan-400 mt-3">Responsible Gaming</p>
            <p>
              Set limits on time and money spent. If gambling feels compulsive, seek help from{" "}
              <a
                href="https://www.ncpg.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline"
              >
                NCPG
              </a>{" "}
              or local resources.
            </p>

            <p className="font-bold text-cyan-400 mt-3">Privacy & Data</p>
            <p>
              Your data is processed per our{" "}
              <a href="/privacy" className="text-cyan-400 hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>

          {/* Acceptance checkbox */}
          <div className="flex items-center gap-2 p-3 bg-cyan-500/5 border border-cyan-500/20 rounded">
            <Checkbox
              id="accept"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked as boolean)}
              className="border-cyan-500"
            />
            <label htmlFor="accept" className="text-sm cursor-pointer text-muted-foreground">
              I accept the terms and am 18+
            </label>
          </div>

          <Button
            onClick={onAccept}
            disabled={!accepted}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold disabled:opacity-50"
          >
            Accept & Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
