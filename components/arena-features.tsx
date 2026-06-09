"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Swords, Zap, Cast as Mask, Trophy } from "lucide-react"
import FeatureModal from "./feature-modal"

interface Feature {
  id: string
  icon: typeof Swords
  title: string
  subtitle: string
  description: string
  image: string
}

const FEATURES: Feature[] = [
  {
    id: "battles",
    icon: Swords,
    title: "Strategic Sewer Battles",
    subtitle: "Turn-based thug strategy",
    description:
      "Master 6 ruthless games of pure strategy. Tic-Tac-Toe to Nine Men's Morris – every move counts, every opponent burns.",
    image: "/images/angry-poop.png",
  },
  {
    id: "bets",
    icon: Zap,
    title: "$DATX Bets & Burns",
    subtitle: "Losers feed the Reserve Hole",
    description:
      "Stake your tokens. Winners take 90%, the rest fuels the sewer economy. 7% to Treasury, 3% to Team – the machine feeds itself.",
    image: "/images/neon-woman-1.png",
  },
  {
    id: "elshito",
    icon: Mask,
    title: "El Shito Power-Ups",
    subtitle: "Random lore twists",
    description:
      "The vigilante strikes. Random events flip the board, change the rules, keep degens on their toes. Everything is chaos.",
    image: "/images/forbidden-tag.png",
  },
  {
    id: "leaderboard",
    icon: Trophy,
    title: "Live Leaderboards",
    subtitle: "Top Shittiest Strategists rewarded",
    description:
      "Rise through the ranks. Eternal glory awaits the sewer's finest. Your name carved in the Reserve Hole – immortal.",
    image: "/images/sewer-lounge.png",
  },
]

export default function ArenaFeatures() {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null)

  return (
    <>
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-primary mb-4 neon-pink">Why Sewer Arena?</h2>
            <p className="text-lg text-muted-foreground">
              Enter the velvet sewer club – where degens bet $DATX on poop vs plunger showdowns.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((feature) => {
              const IconComponent = feature.icon
              return (
                <Card
                  key={feature.id}
                  className="glow-border bg-black/60 backdrop-blur border-2 p-6 hover:shadow-2xl transition-all duration-300 group cursor-pointer"
                  onClick={() => setSelectedFeature(feature)}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-primary/20 group-hover:bg-primary/40 transition-colors">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-foreground">{feature.title}</h3>
                      <p className="text-sm text-accent">{feature.subtitle}</p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{feature.description}</p>

                  <Button
                    variant="outline"
                    className="w-full border-primary/50 hover:bg-primary/10 text-foreground bg-transparent"
                    onClick={() => setSelectedFeature(feature)}
                  >
                    Learn More
                  </Button>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {selectedFeature && <FeatureModal feature={selectedFeature} onClose={() => setSelectedFeature(null)} />}
    </>
  )
}
