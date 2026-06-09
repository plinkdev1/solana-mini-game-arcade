"use client"

import Link from "next/link"
import Header from "@/components/header"
import GamesHero from "@/components/games-hero"
import GameGrid from "@/components/game-grid"
import GamesFooter from "@/components/games-footer"
import { Button } from "@/components/ui/button"

const GAMES = [
  {
    id: 1,
    slug: "tic-tac-toe",
    name: "Poop-Tac-Toe",
    description: "Tic-Tac-Toe",
    lore: "The shittiest strategy game ever made.",
  },
  {
    id: 2,
    slug: "checkers",
    name: "Checker Diarrhea",
    description: "Checkers",
    lore: "Your pieces get flushed one by one.",
  },
  {
    id: 3,
    slug: "gomoku",
    name: "Gomoku Sludge",
    description: "Gomoku",
    lore: "Get five in a row before the swamp fills.",
  },
  {
    id: 4,
    slug: "dots-and-boxes",
    name: "Dots & Feces",
    description: "Dots & Boxes",
    lore: "Draw lines. Own shit. Lose everything.",
  },
  {
    id: 5,
    slug: "halma",
    name: "Halma Hell",
    description: "Halma",
    lore: "Race across the sewer. Someone always drowns.",
  },
  {
    id: 6,
    slug: "nine-mens-morris",
    name: "Nine Shit Morris",
    description: "Nine Men's Morris",
    lore: "Mill your opponent or get milled.",
  },
]

export default function GamesPage() {
  return (
    <main className="min-h-screen bg-background overflow-hidden flex flex-col">
      <Header />

      <div
        className="fixed inset-0 -z-10 top-20 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(26, 15, 26, 0.8) 50%, rgba(10, 10, 10, 0.75) 100%), url('/images/datxit-after-dark.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="fixed inset-0 -z-10 bg-black/60 backdrop-blur-sm top-20" />

      <div className="relative z-10 flex-1 py-12 px-6">
        <div className="max-w-6xl mx-auto mb-8">
          <Link href="/" className="inline-block">
            <Button
              variant="outline"
              className="border-accent/50 hover:border-accent bg-transparent text-accent hover:text-accent hover:bg-accent/10 transition"
            >
              ← Back to Home
            </Button>
          </Link>
        </div>

        <GamesHero />
        <GameGrid games={GAMES} />
        <GamesFooter />
      </div>
    </main>
  )
}
