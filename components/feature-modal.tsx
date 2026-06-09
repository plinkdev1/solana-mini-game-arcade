"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface Feature {
  id: string
  title: string
  subtitle: string
  description: string
  image: string
}

interface FeatureModalProps {
  feature: Feature
  onClose: () => void
}

const FEATURE_DETAILS: Record<string, { fullDescription: string; benefits: string[] }> = {
  battles: {
    fullDescription:
      "From Tic-Tac-Toe to Nine Men's Morris, Sewer Arena hosts 6 brutal games of pure strategy. Every game is turn-based, every opponent is ruthless. Make one wrong move and your tokens vanish into the Reserve Hole.",
    benefits: ["6 unique games", "Skill-based competition", "Real-time betting", "Instant payouts"],
  },
  bets: {
    fullDescription:
      "Stake your $DATX tokens on every game. Winners receive 90% of the full pot. The remaining 10% rake funds the ecosystem: 7% to the Treasury, 3% to the Team. No middleman. Pure sewer economics.",
    benefits: [
      "Transparent rake system",
      "90/7/3 split model",
      "Mock mode for testing",
      "Real wallet integration ready",
    ],
  },
  elshito: {
    fullDescription:
      "El Shito watches from the shadows. At random moments, the vigilante strikes – power-ups appear, rules flip, and the board reshuffles. No two games are ever the same. Chaos is the only constant.",
    benefits: ["Unpredictable gameplay", "Event-driven twists", "Lore integration", "Community events"],
  },
  leaderboard: {
    fullDescription:
      "Your victories are eternal. Climb the leaderboard and etch your name into the sewer's history. Top strategists earn bragging rights, tournament rewards, and immortal glory.",
    benefits: ["Ranked competition", "Persistent stats", "Seasonal tournaments", "Community recognition"],
  },
}

export default function FeatureModal({ feature, onClose }: FeatureModalProps) {
  const details = FEATURE_DETAILS[feature.id] || { fullDescription: feature.description, benefits: [] }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl glow-border border-primary/50 bg-black/80 backdrop-blur">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">{feature.title}</DialogTitle>
          <DialogDescription className="text-accent">{feature.subtitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Feature Image */}
          <div className="relative h-64 rounded-lg overflow-hidden bg-black/40 border border-primary/30">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(233, 30, 99, 0.2) 100%), url('${feature.image}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl opacity-50">💩</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-foreground leading-relaxed">{details.fullDescription}</p>

          {/* Benefits */}
          {details.benefits.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {details.benefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/30"
                >
                  <span className="text-primary">✓</span>
                  <span className="text-sm text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <Button
            onClick={onClose}
            className="w-full bg-primary/50 hover:bg-primary/70 text-black font-bold py-6 rounded-lg transition-colors"
          >
            Enter the Sewer Arena
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
