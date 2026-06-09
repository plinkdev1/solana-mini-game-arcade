"use client"

export default function Hero() {
  return (
    <section className="relative z-10 py-20 px-6 text-center overflow-hidden">
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.75) 0%, rgba(26, 15, 26, 0.85) 50%, rgba(10, 10, 10, 0.8) 100%), url('/images/enter-sewer.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Enhanced dark overlay for text readability */}
      <div className="absolute inset-0 -z-20 bg-black/40 backdrop-blur-sm" />

      <div className="max-w-4xl mx-auto relative">
        <h1 className="text-6xl md:text-7xl font-black mb-6 neon-green glitch">SEWER ARENA</h1>

        <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8">Private Club Games</h2>

        <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
          Bet <span className="text-primary font-bold">$DATX</span> on strategy. Losers feed the{" "}
          <span className="text-accent font-bold">Reserve Hole.</span>
        </p>

        <div className="text-xs text-muted-foreground italic mb-8 animate-pulse">"Brewing fresh sludge..."</div>
      </div>
    </section>
  )
}
