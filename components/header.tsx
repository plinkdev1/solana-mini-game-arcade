"use client"

import Link from "next/link"
import { WalletDisplay } from "@/components/wallet/wallet-display"

export default function Header() {
  return (
    <header className="relative z-40 border-b border-border bg-black/40 backdrop-blur">
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="text-3xl font-bold neon-pink hover:opacity-80 transition">
          🚽 SEWER ARENA
        </Link>

        <div className="flex items-center gap-8">
          <ul className="flex gap-8 text-sm font-medium">
            <li>
              <Link href="/" className="hover:text-primary transition">
                Home
              </Link>
            </li>
            <li>
              <Link href="/games" className="hover:text-primary transition">
                Games
              </Link>
            </li>
            <li>
              <Link href="/stats" className="hover:text-primary transition">
                Stats
              </Link>
            </li>
            <li>
              <Link href="/leaderboard" className="hover:text-primary transition">
                Leaderboard
              </Link>
            </li>
            <li>
              <Link href="/rules" className="hover:text-primary transition">
                Rules
              </Link>
            </li>
          </ul>
          <WalletDisplay />
        </div>
      </nav>
    </header>
  )
}
