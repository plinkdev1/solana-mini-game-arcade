"use client"

export default function AdminStatsPage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="border-b border-neon-pink/20 p-6">
        <h2 className="text-3xl font-bold text-neon-pink">Statistics</h2>
        <p className="text-neon-cyan/60 text-sm mt-2">Overall platform metrics and player statistics</p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl space-y-6">
          {/* Key metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Players", value: "0", color: "neon-cyan" },
              { label: "Active Today", value: "0", color: "neon-pink" },
              { label: "Total Bets", value: "$0", color: "neon-lime" },
              { label: "Platform Revenue", value: "$0", color: "neon-orange" },
            ].map(({ label, value, color }) => (
              <div key={label} className={`border border-${color}/20 rounded-lg p-4 bg-${color}/5`}>
                <p className={`text-${color}/60 text-xs uppercase tracking-wider`}>{label}</p>
                <p className={`text-2xl font-bold text-${color} mt-2`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Leaderboard placeholder */}
          <div className="border border-neon-pink/20 rounded-lg p-6 bg-neon-pink/5">
            <h3 className="text-neon-pink font-bold mb-4">Top Players by Wins</h3>
            <p className="text-neon-cyan/70">Leaderboard data coming soon</p>
          </div>

          {/* Game stats placeholder */}
          <div className="border border-neon-cyan/20 rounded-lg p-6 bg-neon-cyan/5">
            <h3 className="text-neon-cyan font-bold mb-4">Game Statistics</h3>
            <p className="text-neon-cyan/70">Per-game stats and matchmaking metrics coming soon</p>
          </div>
        </div>
      </div>
    </div>
  )
}
