"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AlertCircle, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

export function CookieConsentBanner() {
  const [isOpen, setIsOpen] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
    // Check if user has already consented
    const hasConsented = localStorage.getItem("cookie_consent")
    if (!hasConsented) {
      setIsOpen(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "accepted")
    setIsOpen(false)
  }

  const handleReject = () => {
    // User must accept to proceed - rejection does nothing
    alert("You must accept essential cookies to use Sewer Arena. This is required for GDPR compliance.")
  }

  if (!isHydrated) return null

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="border border-primary/50 bg-background/95 backdrop-blur-sm"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-accent" />
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Accept Essential Cookies?
            </DialogTitle>
          </div>
          <DialogDescription className="text-foreground/70 mt-2">
            We use only essential cookies for gameplay (wallet state, game progress). No tracking or ads. By continuing,
            you accept our{" "}
            <Link href="/private/cookies" className="text-primary hover:underline">
              Cookie Policy
            </Link>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="p-3 rounded border border-accent/30 bg-accent/5">
            <p className="text-sm text-foreground/80">
              <span className="font-semibold text-accent">Essential Only:</span> Session cookies, localStorage tokens
              for game state.
            </p>
          </div>
          <div className="p-3 rounded border border-accent/30 bg-accent/5">
            <p className="text-sm text-foreground/80">
              <span className="font-semibold text-accent">Never:</span> Analytics, ads, tracking, or third-party data
              sharing.
            </p>
          </div>
          <div className="p-3 rounded border border-primary/50 bg-primary/5 flex gap-2">
            <Lock className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground/80">
              <span className="font-semibold text-primary">GDPR Compliance:</span> You must accept to proceed. We cannot
              provide service without your consent.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleReject}
            className="border-accent/50 hover:border-accent hover:bg-accent/10 bg-transparent"
          >
            Reject & Exit
          </Button>
          <Button
            onClick={handleAccept}
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80 text-background font-semibold"
          >
            Accept Essential Cookies
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
