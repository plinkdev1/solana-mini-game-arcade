"use client"

import { useAdminStore } from "@/lib/stores/admin-store"
import { useWalletStore } from "@/lib/stores/wallet-store"

export default function AdminDashboard() {
  const { isAdmin } = useAdminStore()
  const { publicKey } = useWalletStore()

  if (!isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-neon-cyan/50">Authenticating...</div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-neon-pink/20 p-6">
        <h2
          className="text-3xl font-bold text-neon-pink drop-shadow-lg"
          style={{ textShadow: "0 0 10px rgba(255, 20, 147, 0.5)" }}
        >
          Dashboard
        </h2>
        <p className="text-neon-cyan/60 text-sm mt-2">
          Admin: {publicKey?.slice(0, 8)}...{publicKey?.slice(-6)}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "Live Matches", value: "0", color: "neon-cyan" },
              { title: "Total Bets", value: "$0", color: "neon-pink" },
              { title: "Active Players", value: "0", color: "neon-lime" },
              { title: "Revenue", value: "$0", color: "neon-orange" },
            ].map((stat) => (
              <div key={stat.title} className={`border border-${stat.color}/30 rounded-lg p-6 bg-${stat.color}/5`}>
                <p className={`text-${stat.color}/70 text-sm mb-2`}>{stat.title}</p>
                <p className={`text-4xl font-bold text-${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="border border-neon-pink/20 rounded-lg p-6 bg-neon-pink/5">
            <h3 className="text-neon-pink font-bold mb-4">Recent Activity</h3>
            <p className="text-neon-cyan/50">No recent activity</p>
          </div>
        </div>
      </div>
    </div>
  )
}
