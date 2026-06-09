"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function LegalDisclaimersFooter() {
  const [disclaimerOpen, setDisclaimerOpen] = useState(false)

  return (
    <>
      <footer className="border-t border-cyan-500/20 bg-background/50 py-6 px-4 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 Sewer Arena. All rights reserved.</p>

          <div className="flex gap-4">
            <a href="/privacy" className="text-cyan-400 hover:underline">
              Privacy Policy
            </a>
            <a href="/terms" className="text-cyan-400 hover:underline">
              Terms of Service
            </a>
            <button onClick={() => setDisclaimerOpen(true)} className="text-cyan-400 hover:underline">
              Responsible Gaming
            </button>
          </div>
        </div>
      </footer>

      {/* Responsible Gaming Modal */}
      <Dialog open={disclaimerOpen} onOpenChange={setDisclaimerOpen}>
        <DialogContent className="border-cyan-500/30 bg-background/95 backdrop-blur max-w-md">
          <DialogHeader>
            <DialogTitle className="text-cyan-400">🎮 Responsible Gaming & Disclaimers</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-sm max-h-96 overflow-y-auto">
            <div className="space-y-2">
              <p className="font-bold text-cyan-400">For Entertainment Only</p>
              <p className="text-muted-foreground">
                Sewer Arena is a mock/simulated gaming platform. All bets and transactions are simulated and not real.
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-cyan-400">Age Requirement</p>
              <p className="text-muted-foreground">Must be 18 years or older to use this platform.</p>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-cyan-400">Responsible Play</p>
              <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                <li>Set time limits for gaming sessions</li>
                <li>Set spending limits on in-game currency</li>
                <li>Take regular breaks</li>
                <li>Never chase losses</li>
                <li>Play for entertainment, not income</li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-cyan-400">Get Help</p>
              <p className="text-muted-foreground">If gaming feels compulsive, seek support:</p>
              <ul className="text-muted-foreground space-y-1">
                <li>
                  <a
                    href="https://www.ncpg.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline"
                  >
                    National Council on Problem Gaming (NCPG)
                  </a>{" "}
                  – 1-800-522-4700
                </li>
                <li>
                  <a
                    href="https://www.gamblersanonymous.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline"
                  >
                    Gamblers Anonymous
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-cyan-400">Rate Limiting</p>
              <p className="text-muted-foreground">
                To promote responsible play, each wallet is limited to 5 games per hour.
              </p>
            </div>
          </div>

          <Button
            onClick={() => setDisclaimerOpen(false)}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
