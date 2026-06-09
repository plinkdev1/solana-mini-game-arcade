"use client"

export default function MatchmakingHero() {
  return (
    <section className="relative py-16 px-6 text-center overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 right-1/4 w-80 h-80 bg-green-500/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative max-w-3xl mx-auto">
        <div className="mb-2 text-sm font-bold text-cyan-400 uppercase tracking-widest animate-bounce">
          🎮 Find Your Opponent 🎮
        </div>

        <h1
          className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400 mb-3"
          style={{ textShadow: "0 0 30px rgba(34, 211, 238, 0.8)" }}
        >
          Matchmaking Pit
        </h1>

        <p className="text-lg text-muted-foreground mb-4 max-w-2xl mx-auto">
          Browse open games or jump into the queue for instant random pairing. Pick your bet size. Battle begins.
        </p>

        <div className="text-center text-xl animate-bounce">🚽 💪 🚽</div>
      </div>
    </section>
  )
}
