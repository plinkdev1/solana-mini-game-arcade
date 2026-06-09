"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import GameCard from "./game-card"

const FEATURED_GAMES = [
  {
    id: 1,
    slug: "tic-tac-toe",
    name: "Poop-Tac-Toe",
    description: "Tic-Tac-Toe",
    lore: "Three swirls in a row to flush victory.",
    betRange: "0.01–0.1 $DATX",
    winCondition: "3 in a row",
    image: "/images/angry-poop.png",
  },
  {
    id: 2,
    slug: "checkers",
    name: "Checker Diarrhea",
    description: "Checkers",
    lore: "Your pieces get flushed one by one.",
    betRange: "0.01–0.1 $DATX",
    winCondition: "Capture all pieces",
    image: "/images/neon-woman-1.png",
  },
  {
    id: 3,
    slug: "gomoku",
    name: "Gomoku Sludge",
    description: "Gomoku",
    lore: "Get five in a row before the swamp fills.",
    betRange: "0.01–0.1 $DATX",
    winCondition: "5 in a row",
    image: "/images/neon-woman-2.png",
  },
  {
    id: 4,
    slug: "dots-and-boxes",
    name: "Dots & Feces",
    description: "Dots & Boxes",
    lore: "Draw lines. Own shit. Lose everything.",
    betRange: "0.01–0.1 $DATX",
    winCondition: "Most boxes",
    image: "/images/forbidden-tag.png",
  },
  {
    id: 5,
    slug: "halma",
    name: "Halma Hell",
    description: "Halma",
    lore: "Race across the sewer. Someone always drowns.",
    betRange: "0.01–0.1 $DATX",
    winCondition: "Reach opposite corner",
    image: "/images/sewer-lounge.png",
  },
  {
    id: 6,
    slug: "nine-mens-morris",
    name: "Nine Shit Morris",
    description: "Nine Men's Morris",
    lore: "Mill your opponent or get milled.",
    betRange: "0.01–0.1 $DATX",
    winCondition: "Three in a mill",
    image: "/images/datxit-after-dark.png",
  },
]

export default function GamesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)

  useEffect(() => {
    if (!autoPlay) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % FEATURED_GAMES.length)
    }, 6000) // 6 seconds

    return () => clearInterval(interval)
  }, [autoPlay])

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + FEATURED_GAMES.length) % FEATURED_GAMES.length)
    setAutoPlay(false)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % FEATURED_GAMES.length)
    setAutoPlay(false)
  }

  const handleDotClick = (index: number) => {
    setCurrentIndex(index)
    setAutoPlay(false)
  }

  return (
    <section className="relative z-10 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-primary mb-2 text-center">Featured Games</h2>
        <p className="text-center text-accent mb-8">Challenge yourself in the Sewer Arena's hottest games</p>

        <div className="relative bg-black/40 border-2 border-primary/50 rounded-lg p-8 backdrop-blur-sm">
          {/* Main carousel display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {FEATURED_GAMES.map((game, index) => (
              <div
                key={game.id}
                className={`transition-all duration-500 ${
                  index === currentIndex ? "opacity-100 scale-100" : "opacity-30 scale-95 hidden md:block"
                }`}
              >
                <GameCard game={game} />
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mb-6">
            <button
              onClick={handlePrev}
              className="p-2 rounded-full border-2 border-primary/50 hover:border-primary hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 group"
              aria-label="Previous game"
            >
              <ChevronLeft className="w-6 h-6 text-primary group-hover:text-accent" />
            </button>

            <div className="flex gap-3 justify-center">
              {FEATURED_GAMES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-primary shadow-lg shadow-primary/50 w-6"
                      : "bg-primary/40 hover:bg-primary/60"
                  }`}
                  aria-label={`Go to game ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="p-2 rounded-full border-2 border-primary/50 hover:border-primary hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 group"
              aria-label="Next game"
            >
              <ChevronRight className="w-6 h-6 text-primary group-hover:text-accent" />
            </button>
          </div>

          <div className="text-center">
            <Link href="/games">
              <Button className="bg-primary/50 hover:bg-primary/70 text-black font-bold px-8">
                View All {FEATURED_GAMES.length + 14} Games
              </Button>
            </Link>
          </div>
        </div>

        {/* Auto-play status indicator */}
        <div className="text-center mt-4 text-xs text-muted-foreground">
          {autoPlay ? "Auto-rotating every 6 seconds" : "Manual navigation active"}
        </div>
      </div>
    </section>
  )
}
