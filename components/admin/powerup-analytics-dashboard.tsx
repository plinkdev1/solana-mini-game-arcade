"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Spinner } from "@/components/ui/spinner"
import { getPowerUpStats } from "@/lib/supabase/analytics-service"

const COLORS = ["#00d9ff", "#ff006e", "#ffb703", "#8338ec", "#3a86ff", "#fb5607"]

export default function PowerUpAnalyticsDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(7)

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true)
      const data = await getPowerUpStats(days)
      setStats(data)
      setLoading(false)
    }

    loadStats()
    const interval = setInterval(loadStats, 30000) // Refresh every 30s

    return () => clearInterval(interval)
  }, [days])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    )
  }

  const typeChartData = stats?.byType
    ? Object.entries(stats.byType).map(([type, count]) => ({
        name: type.replace(/_/g, " "),
        value: count,
      }))
    : []

  return (
    <div className="grid gap-6 p-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-cyan-400/30 bg-gradient-to-br from-cyan-900/10 to-transparent">
          <CardHeader>
            <CardTitle className="text-cyan-400">Total Power-Ups</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-cyan-300">{stats?.total || 0}</p>
            <p className="text-sm text-cyan-500">Last {stats?.daysTracked} days</p>
          </CardContent>
        </Card>

        <Card className="border-pink-400/30 bg-gradient-to-br from-pink-900/10 to-transparent">
          <CardHeader>
            <CardTitle className="text-pink-400">Boost Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-pink-300">{stats?.boostedWinRate || 0}%</p>
            <p className="text-sm text-pink-500">With active boosts</p>
          </CardContent>
        </Card>

        <Card className="border-lime-400/30 bg-gradient-to-br from-lime-900/10 to-transparent">
          <CardHeader>
            <CardTitle className="text-lime-400">Unique Types</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-lime-300">{Object.keys(stats?.byType || {}).length}</p>
            <p className="text-sm text-lime-500">Power-up variants</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-cyan-400/20">
          <CardHeader>
            <CardTitle className="text-cyan-300">Power-Up Distribution</CardTitle>
            <CardDescription>Frequency by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-pink-400/20">
          <CardHeader>
            <CardTitle className="text-pink-300">Top Power-Ups</CardTitle>
            <CardDescription>Most triggered effects</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeChartData.sort((a, b) => (b.value as number) - (a.value as number)).slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#888" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #00d9ff" }} />
                <Bar dataKey="value" fill="#00d9ff" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Time Filter */}
      <Card className="border-lime-400/20">
        <CardHeader>
          <CardTitle className="text-lime-300">Time Range</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded border ${
                days === d
                  ? "bg-lime-400/20 border-lime-400 text-lime-300"
                  : "border-gray-600 text-gray-400 hover:border-lime-400"
              }`}
            >
              {d} Days
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
