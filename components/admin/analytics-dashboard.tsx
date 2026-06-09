"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { getPowerUpStats, subscribeToPowerUpEvents } from "@/lib/supabase/analytics-service"
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [recentEvents, setRecentEvents] = useState<any[]>([])
  const [timeRange, setTimeRange] = useState(7)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      const data = await getPowerUpStats(timeRange)
      setStats(data)
      setLoading(false)
    }

    fetchStats()

    // Subscribe to real-time events
    const channel = subscribeToPowerUpEvents((event) => {
      setRecentEvents((prev) => [event, ...prev.slice(0, 9)])
    })

    return () => {
      channel.unsubscribe()
    }
  }, [timeRange])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground mt-4">Loading analytics...</p>
        </div>
      </div>
    )
  }

  // Pie chart data
  const pieData = stats?.byType ? Object.entries(stats.byType).map(([name, value]) => ({ name, value })) : []

  // Mock time-series data (7 days)
  const timeSeriesData = Array.from({ length: timeRange }, (_, i) => ({
    day: `Day ${i + 1}`,
    count: Math.floor(Math.random() * 50) + 10,
  }))

  const chartColors = ["#e91e63", "#5d4037", "#00ff41", "#ff00ff", "#00ffff", "#ffaa00"]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-pink-400 to-pink-300 bg-clip-text text-transparent">
          El Shito Analytics Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">Power-Up Usage & Win Rate Analytics</p>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2 mb-6">
        {[7, 30, 90].map((days) => (
          <Button
            key={days}
            onClick={() => setTimeRange(days)}
            variant={timeRange === days ? "default" : "outline"}
            className={timeRange === days ? "bg-primary hover:bg-primary/90" : "border-border hover:border-primary"}
          >
            {days} Days
          </Button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="border-primary/30 bg-card/80 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Power-Ups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Last {timeRange} days</p>
          </CardContent>
        </Card>

        <Card className="border-accent/30 bg-card/80 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Boosted Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{stats?.boostedWinRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">With active NFT boost</p>
          </CardContent>
        </Card>

        <Card className="border-pink-500/30 bg-card/80 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unique Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-pink-400">{Object.keys(stats?.byType || {}).length}</div>
            <p className="text-xs text-muted-foreground mt-1">Power-up varieties triggered</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Power-Ups by Type - Pie Chart */}
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Power-Up Distribution</CardTitle>
            <CardDescription>Breakdown by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Time Series - Line Chart */}
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Power-Ups Per Day</CardTitle>
            <CardDescription>Trend over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={{ fill: "var(--primary)", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle>Recent Power-Up Events</CardTitle>
          <CardDescription>Real-time activity feed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {recentEvents.length > 0 ? (
              recentEvents.map((event, idx) => (
                <div key={idx} className="p-3 bg-muted/50 rounded border border-border/30 text-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-foreground">{event.power_up_type}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.game_type} • {event.game_outcome || "ongoing"}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${event.boost_active ? "bg-accent/20 text-accent" : "bg-muted"}`}
                    >
                      {event.boost_percentage}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">No events yet...</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
