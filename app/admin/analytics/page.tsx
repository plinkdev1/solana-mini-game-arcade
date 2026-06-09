"use client"

import { useState, useEffect } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase/client"

interface PowerUpEvent {
  id: string
  power_up_type: string
  game_type: string
  game_outcome: string
  boost_percentage: number
  triggered_at: string
  created_at: string
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [powerUpData, setPowerUpData] = useState<PowerUpEvent[]>([])
  const [pieData, setPieData] = useState<any[]>([])
  const [barData, setBarData] = useState<any[]>([])
  const [lineData, setLineData] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from("powerup_events")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1000)

        if (error) throw error

        setPowerUpData(data || [])

        // Process pie chart data: power-up type distribution
        const typeCount = (data || []).reduce((acc: Record<string, number>, event: PowerUpEvent) => {
          acc[event.power_up_type] = (acc[event.power_up_type] || 0) + 1
          return acc
        }, {})
        setPieData(
          Object.entries(typeCount).map(([name, value]) => ({
            name,
            value,
          })),
        )

        // Process bar chart data: win rates by power-up type
        const winRates = (data || []).reduce(
          (acc: Record<string, { wins: number; total: number }>, event: PowerUpEvent) => {
            if (!acc[event.power_up_type]) {
              acc[event.power_up_type] = { wins: 0, total: 0 }
            }
            acc[event.power_up_type].total += 1
            if (event.game_outcome === "win") {
              acc[event.power_up_type].wins += 1
            }
            return acc
          },
          {},
        )
        setBarData(
          Object.entries(winRates).map(([name, { wins, total }]) => ({
            name,
            winRate: Math.round((wins / total) * 100),
          })),
        )

        // Process line chart data: daily usage trends
        const dailyUsage = (data || []).reduce((acc: Record<string, number>, event: PowerUpEvent) => {
          const date = new Date(event.triggered_at).toLocaleDateString()
          acc[date] = (acc[date] || 0) + 1
          return acc
        }, {})
        setLineData(
          Object.entries(dailyUsage)
            .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
            .slice(-30) // last 30 days
            .map(([date, count]) => ({
              date,
              usage: count,
            })),
        )
      } catch (error) {
        console.error("Error fetching analytics:", error)
        toast({
          title: "Error",
          description: "Failed to load analytics data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [toast])

  const COLORS = ["#FF69B4", "#00D4FF", "#00FF41", "#FFA500", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"]

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="border-b border-neon-pink/20 p-6">
        <h2 className="text-3xl font-bold text-neon-pink">Analytics</h2>
        <p className="text-neon-cyan/60 text-sm mt-2">Power-up performance and player behavior insights</p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl space-y-6">
          {loading ? (
            <div className="text-center text-neon-cyan/50 py-8">Loading analytics...</div>
          ) : (
            <>
              <div className="border border-neon-cyan/20 rounded-lg p-6 bg-neon-cyan/5">
                <h3 className="text-neon-cyan font-bold mb-4">Power-Up Type Distribution</h3>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#1E293B", border: "1px solid #FF69B4" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-neon-cyan/50 py-8">No data available</div>
                )}
              </div>

              <div className="border border-neon-pink/20 rounded-lg p-6 bg-neon-pink/5">
                <h3 className="text-neon-pink font-bold mb-4">Win Rate by Power-Up Type</h3>
                {barData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#FF69B4/20" />
                      <XAxis dataKey="name" stroke="#00D4FF" />
                      <YAxis stroke="#00D4FF" />
                      <Tooltip contentStyle={{ backgroundColor: "#1E293B", border: "1px solid #FF69B4" }} />
                      <Bar dataKey="winRate" fill="#00FF41" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-neon-pink/50 py-8">No data available</div>
                )}
              </div>

              <div className="border border-neon-lime/20 rounded-lg p-6 bg-neon-lime/5">
                <h3 className="text-neon-lime font-bold mb-4">Daily Power-Up Usage (Last 30 Days)</h3>
                {lineData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={lineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#00FF41/20" />
                      <XAxis dataKey="date" stroke="#00D4FF" />
                      <YAxis stroke="#00D4FF" />
                      <Tooltip contentStyle={{ backgroundColor: "#1E293B", border: "1px solid #00FF41" }} />
                      <Line
                        type="monotone"
                        dataKey="usage"
                        stroke="#FF69B4"
                        strokeWidth={2}
                        dot={{ fill: "#FF69B4" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-neon-lime/50 py-8">No data available</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
