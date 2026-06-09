"use client"

import Link from "next/link"
import { Heart, Lock, Scale, AlertTriangle, Cookie } from "lucide-react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletModalFooter } from "@/components/wallet/wallet-modal-footer"
import { useWalletStore } from "@/lib/stores/wallet-store"

export function Footer() {
  const { connected } = useWallet()
  const mode = useWalletStore((state) => state.mode)
  const network = useWalletStore((state) => state.network)

  return (
    <footer className="relative border-t border-primary/50 bg-background/80 backdrop-blur-sm mt-20">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-1.5 bg-primary blur-xl opacity-60 rounded-full" />

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Main footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand section */}
          <div className="space-y-4 md:col-span-1">
            <h3 className="text-xl font-black bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Sewer Arena
            </h3>
            <p className="text-sm text-foreground/70 leading-relaxed">
              P2P gaming arena where your stakes feed the Reserve Hole. Play. Compete. Earn mock glory.
            </p>
            <div className="flex items-center gap-2 text-xs text-foreground/50 pt-2 border-t border-accent/20">
              <Heart size={12} className="text-primary animate-pulse" />
              <span>Built with lore by DatXit</span>
            </div>
          </div>

          {/* Navigation section */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-primary uppercase tracking-widest">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-foreground/70 hover:text-primary transition-colors duration-200 flex items-center gap-2"
                >
                  <span className="w-1 h-1 rounded-full bg-accent opacity-0 group-hover:opacity-100" />
                  Home
                </Link>
              </li>
              <li>
                <Link href="/games" className="text-foreground/70 hover:text-primary transition-colors duration-200">
                  Games
                </Link>
              </li>
              <li>
                <Link
                  href="/leaderboard"
                  className="text-foreground/70 hover:text-primary transition-colors duration-200"
                >
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/stats" className="text-foreground/70 hover:text-primary transition-colors duration-200">
                  Your Stats
                </Link>
              </li>
              <li>
                <Link href="/rules" className="text-foreground/70 hover:text-primary transition-colors duration-200">
                  Rules
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal section */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
              <Scale size={14} />
              Legal
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/private/privacy"
                  className="text-foreground/70 hover:text-primary transition-colors duration-200 flex items-center gap-2"
                >
                  <Lock size={12} className="text-accent" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/private/disclaimers"
                  className="text-foreground/70 hover:text-primary transition-colors duration-200 flex items-center gap-2"
                >
                  <AlertTriangle size={12} className="text-destructive" />
                  Disclaimers
                </Link>
              </li>
              <li>
                <Link
                  href="/private/terms"
                  className="text-foreground/70 hover:text-primary transition-colors duration-200 flex items-center gap-2"
                >
                  <Scale size={12} className="text-primary" />
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/private/cookies"
                  className="text-foreground/70 hover:text-primary transition-colors duration-200 flex items-center gap-2"
                >
                  <Cookie size={12} className="text-accent" />
                  Cookie Consent
                </Link>
              </li>
            </ul>
          </div>

          {/* Compliance section */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-accent uppercase tracking-widest">Compliance</h4>
            <div className="space-y-2 text-xs">
              <div className="px-3 py-2 rounded border border-accent/50 bg-accent/5">
                <span className="text-accent font-semibold">GDPR</span>
                <p className="text-foreground/60 text-xs mt-1">EU Data Protected</p>
              </div>
              <div className="px-3 py-2 rounded border border-primary/50 bg-primary/5">
                <span className="text-primary font-semibold">18+</span>
                <p className="text-foreground/60 text-xs mt-1">Age Restricted</p>
              </div>
              <div className="px-3 py-2 rounded border border-accent/50 bg-accent/5">
                <span className="text-accent font-semibold">Beta</span>
                <p className="text-foreground/60 text-xs mt-1">Solo Project</p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent mb-8" />

        {/* Bottom section */}
        <div className="space-y-4">
          <p className="text-xs text-foreground/60 leading-relaxed">
            Sewer Arena is a mock-currency gaming platform. No real money. Beta software. Play responsibly. By accessing
            this site, you agree to our Terms of Service and Privacy Policy.
          </p>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-foreground/50">
            <p>© 2026 DatXit – Everything is Shit</p>
            <div className="flex items-center gap-3 flex-wrap">
              <WalletModalFooter />
              <span
                className={`px-2 py-1 rounded-full border ${
                  mode === "mock"
                    ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                    : "border-green-500/50 bg-green-500/10 text-green-400"
                }`}
              >
                {mode === "mock" ? "Mock Mode" : "Real Mode"}
              </span>
              <span
                className={`px-2 py-1 rounded-full border ${
                  mode === "mock"
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                }`}
              >
                {mode === "mock" ? "No Real $" : "$DATX"}
              </span>
              <span
                className={`px-2 py-1 rounded-full border ${
                  network === "devnet"
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                    : "border-green-500/30 bg-green-500/10 text-green-400"
                }`}
              >
                {network === "devnet" ? "Devnet" : "Mainnet"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
