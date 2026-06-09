"use client"

export default function GamesFooter() {
  return (
    <section className="relative py-12 px-6 border-t border-pink-500/30 mt-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Main Reserve Hole Section */}
        <div className="bg-black/40 backdrop-blur border-2 border-pink-500/50 rounded-lg p-8">
          <p className="text-sm text-muted-foreground mb-4">All games bet $DATX – Universal Rake Applied</p>
          <p
            className="text-2xl font-black text-pink-400 neon-pink mb-2"
            style={{ textShadow: "0 0 20px rgba(233, 30, 99, 0.8)" }}
          >
            Reserve Hole Takes 10% Rake Every Game
          </p>
          <p className="text-sm text-accent mb-4">Winners get 90% of pot • 7% Treasury DAO • 3% Team Wallet</p>
          <div className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
            <p>Every game end deducts rake from the full pot. Win, lose, or draw – the Reserve Hole feeds:</p>
            <p className="mt-2 font-semibold text-pink-300">
              💰 <strong>7%</strong> flows to Treasury DAO | 🎯 <strong>3%</strong> flows to Team
            </p>
          </div>
        </div>

        {/* Leaderboard & Power-Ups Enticement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-accent/10 border border-accent/50 rounded-lg p-6">
            <p className="text-lg font-bold text-accent mb-2">📊 Climb Leaderboards</p>
            <p className="text-sm text-muted-foreground">
              Track your wins, climb global rankings, and earn prestige. Highest scorers get eternal sewer fame.
            </p>
          </div>
          <div className="bg-pink-900/20 border border-pink-500/50 rounded-lg p-6">
            <p className="text-lg font-bold text-pink-400 mb-2">⚡ El Shito Power-Ups</p>
            <p className="text-sm text-muted-foreground">
              Random chaos erupts each game. Flush strikes, vortex swaps, and plunger pulls. Expect the unexpected.
            </p>
          </div>
        </div>

        {/* Animated Footer */}
        <div className="text-center space-y-4">
          <div className="text-3xl animate-bounce" style={{ animationDuration: "2s" }}>
            💩 💧 💩
          </div>
          <p className="text-xs text-muted-foreground italic">Sewer Arena: Where degeneracy meets destiny</p>
        </div>
      </div>
    </section>
  )
}
