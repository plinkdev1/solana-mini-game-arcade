"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Cookie, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Card } from "@/components/ui/card"

export function CookieContent() {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) return null

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Main Explanation */}
      <Card className="border border-accent/50 p-6 bg-background/50">
        <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
          <Cookie className="w-6 h-6" />
          What Are Cookies?
        </h2>
        <p className="text-foreground/80 leading-relaxed">
          Cookies are small text files stored in your browser that remember information about your visit. Sewer Arena
          uses only essential cookies to keep your gameplay running smoothly—tracking your game progress, wallet
          connection, and game history. We do NOT use cookies for marketing, ads, or tracking your behavior across the
          internet.
        </p>
      </Card>

      {/* Essential Cookies */}
      <Card className="border border-primary/50 p-6 bg-background/50">
        <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-accent" />
          Essential Cookies (Required)
        </h2>
        <div className="space-y-3 text-foreground/80">
          <div>
            <p className="font-semibold text-primary">Session Cookies</p>
            <p className="text-sm">Keep you logged in and maintain your game state during play sessions.</p>
          </div>
          <div>
            <p className="font-semibold text-primary">Game Progress Tokens</p>
            <p className="text-sm">Track your moves, bets, and game outcomes for leaderboard and stats calculation.</p>
          </div>
          <div>
            <p className="font-semibold text-primary">Wallet Connection Tokens</p>
            <p className="text-sm">
              Remember your Solana wallet connection for seamless reconnection on your next visit.
            </p>
          </div>
          <div>
            <p className="font-semibold text-primary">localStorage for Game State</p>
            <p className="text-sm">
              Persist your game board state, betting data, and mock balance across browser refreshes.
            </p>
          </div>
        </div>
      </Card>

      {/* Non-Essential Cookies */}
      <Card className="border border-destructive/30 p-6 bg-background/50">
        <h2 className="text-2xl font-bold text-destructive mb-4 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6" />
          Cookies We DO NOT Use
        </h2>
        <ul className="space-y-2 text-foreground/80 text-sm">
          <li className="flex gap-2">
            <span className="text-accent">✗</span>
            <span>
              <strong>Analytics Cookies:</strong> No Google Analytics, Mixpanel, or similar tracking tools.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-accent">✗</span>
            <span>
              <strong>Marketing Cookies:</strong> We don't track you for ads or retargeting.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-accent">✗</span>
            <span>
              <strong>Profiling Cookies:</strong> No third-party data brokers or behavioral profiling.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-accent">✗</span>
            <span>
              <strong>Cross-Domain Tracking:</strong> Your activity is never tracked across other websites.
            </span>
          </li>
        </ul>
      </Card>

      {/* Cookie Management */}
      <Card className="border border-accent/50 p-6 bg-background/50">
        <h2 className="text-2xl font-bold text-primary mb-4">How to Manage Cookies</h2>
        <div className="space-y-4 text-foreground/80 text-sm">
          <div>
            <p className="font-semibold text-primary mb-2">Accept on First Visit</p>
            <p>
              When you first visit Sewer Arena, a dialog appears asking for cookie consent. Click "Accept Essential
              Cookies" to proceed with full gameplay functionality.
            </p>
          </div>
          <div>
            <p className="font-semibold text-primary mb-2">Browser Settings</p>
            <p>
              You can manage cookies in your browser settings (Chrome, Firefox, Safari, Edge). Disabling essential
              cookies may break gameplay features like game progression and wallet connection.
            </p>
          </div>
          <div>
            <p className="font-semibold text-primary mb-2">Clear Cookies Anytime</p>
            <p>
              Clear your browser cache and cookies at any time. You may need to reconnect your wallet and re-accept
              cookies on your next visit.
            </p>
          </div>
        </div>
      </Card>

      {/* GDPR Compliance */}
      <Card className="border border-primary/50 p-6 bg-primary/5">
        <h2 className="text-2xl font-bold text-primary mb-4">GDPR Compliance</h2>
        <p className="text-foreground/80 leading-relaxed mb-4">
          Sewer Arena complies with the General Data Protection Regulation (GDPR) requirements for cookie usage:
        </p>
        <ul className="space-y-2 text-foreground/80 text-sm">
          <li className="flex gap-2">
            <span className="text-accent">✓</span>
            <span>Clear consent obtained before non-essential cookies are placed.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-accent">✓</span>
            <span>Easy opt-out mechanism—reject cookies without penalty.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-accent">✓</span>
            <span>Transparent cookie policy—this page explains everything clearly.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-accent">✓</span>
            <span>No data shared with third parties—cookies are only used for gameplay.</span>
          </li>
        </ul>
      </Card>

      {/* Contact & Questions */}
      <Card className="border border-accent/50 p-6 bg-background/50">
        <h2 className="text-2xl font-bold text-primary mb-4">Questions About Cookies?</h2>
        <p className="text-foreground/80 mb-4">
          For more details, check our{" "}
          <Link href="/private/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>{" "}
          or contact support via the site.
        </p>
        <p className="text-sm text-foreground/60">Last Updated: January 2026</p>
      </Card>
    </div>
  )
}
