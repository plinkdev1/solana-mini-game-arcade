"use client"

export function StatsHero() {
  return (
    <div className="relative py-12 px-6 overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 20% 50%, rgba(233, 30, 99, 0.15) 0%, transparent 40%),
              radial-gradient(ellipse at 80% 80%, rgba(139, 69, 19, 0.15) 0%, transparent 50%),
              linear-gradient(135deg, #1a0f1a 0%, #0a0a0a 50%, #0f1a0a 100%)
            `,
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-600 mb-4 animate-pulse">
          Your Sewer Stats
        </h1>
        <p className="text-xl text-accent mb-2">Flush Tracker</p>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Track your wins, losses, and earnings in the Sewer Arena. Every game contributes to your legend.
        </p>
      </div>
    </div>
  )
}
