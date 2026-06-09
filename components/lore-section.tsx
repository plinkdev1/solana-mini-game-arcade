"use client"

import { useEffect, useState } from "react"

export default function LoreSection() {
  const [poops, setPoops] = useState<Array<{ id: number; left: number; delay: number }>>([])

  useEffect(() => {
    setPoops(
      Array.from({ length: 5 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
      })),
    )
  }, [])

  return (
    <section className="relative z-10 py-20 px-6 overflow-hidden">
      <div className="max-w-4xl mx-auto">
        {/* Dripping sludge animation background */}
        <div className="absolute inset-0 -z-10">
          {poops.map((poop) => (
            <div
              key={poop.id}
              className="absolute text-4xl opacity-30 animate-bounce"
              style={{
                left: `${poop.left}%`,
                top: "-50px",
                animationDelay: `${poop.delay}s`,
              }}
            >
              💧
            </div>
          ))}
        </div>

        <div className="glow-border border-2 bg-black/60 backdrop-blur rounded-xl p-12 text-center space-y-8">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-primary mb-4 neon-pink">The Velvet Sewer Club</h2>
            <p className="text-xl text-muted-foreground italic">Where degens bet $DATX on poop vs plunger showdowns.</p>
          </div>

          <p className="text-lg text-foreground leading-relaxed max-w-2xl mx-auto">
            Everything is shit. Politics. Economy. Weather. Crypto. Life. Family. Holidays. News. Society. We embrace
            it. <span className="text-primary font-bold">Here in the sewer, we stopped coping.</span>
          </p>

          <p className="text-lg text-accent font-bold">
            Flush your expectations. Burn through strategy. Meme your way to glory.
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <span className="px-4 py-2 rounded-full bg-primary/20 border border-primary/50 text-primary font-bold text-sm">
              #DatXitToTheSewer
            </span>
            <span className="px-4 py-2 rounded-full bg-accent/20 border border-accent/50 text-accent font-bold text-sm">
              The shitty world ends where DatXit begins
            </span>
          </div>

          {/* Animated poop train */}
          <div className="pt-8 flex justify-center gap-2 text-4xl animate-pulse">
            <span>💩</span>
            <span>🚽</span>
            <span>💩</span>
            <span>🚽</span>
            <span>💩</span>
          </div>
        </div>
      </div>
    </section>
  )
}
