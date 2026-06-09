"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { getAdminFeedback, markFeedbackReplied } from "@/lib/utils/feedback"
import { supabase } from "@/lib/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FeedbackEntry {
  id: string
  user_wallet: string | null
  message: string
  rating: number | null
  created_at: string
  replied: boolean
}

export default function AdminFeedbackPage() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [feedbackList, setFeedbackList] = useState<FeedbackEntry[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Hardcoded admin password (in production, use proper auth)
  const ADMIN_PASSWORD = "ElShito2024"

  // Filter states
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [ratingFilter, setRatingFilter] = useState<string>("all")
  const [filteredFeedback, setFilteredFeedback] = useState<FeedbackEntry[]>([])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      loadFeedback()
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid password",
        variant: "destructive",
      })
    }
  }

  const loadFeedback = async () => {
    setLoading(true)
    const { data, error } = await getAdminFeedback()
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load feedback",
        variant: "destructive",
      })
    } else {
      setFeedbackList(data || [])
    }
    setLoading(false)
  }

  // Subscribe to realtime updates
  useEffect(() => {
    if (!isAuthenticated) return

    const channel = supabase
      .channel("feedback_entries")
      .on("postgres_changes", { event: "*", schema: "public", table: "feedback_entries" }, (payload) => {
        loadFeedback()
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [isAuthenticated])

  // Filter logic
  useEffect(() => {
    let filtered = feedbackList

    // Filter by date
    if (dateFilter !== "all") {
      const now = new Date()
      const filterDate = new Date()
      if (dateFilter === "7days") filterDate.setDate(now.getDate() - 7)
      if (dateFilter === "30days") filterDate.setDate(now.getDate() - 30)
      filtered = filtered.filter((f) => new Date(f.created_at) >= filterDate)
    }

    // Filter by rating
    if (ratingFilter !== "all") {
      const rating = Number.parseInt(ratingFilter)
      filtered = filtered.filter((f) => f.rating === rating)
    }

    setFilteredFeedback(filtered)
  }, [feedbackList, dateFilter, ratingFilter])

  const handleToggleReplied = async (feedbackId: string) => {
    const { success } = await markFeedbackReplied(feedbackId)
    if (success) {
      setFeedbackList(feedbackList.map((f) => (f.id === feedbackId ? { ...f, replied: !f.replied } : f)))
      toast({
        title: "Updated",
        description: "Feedback marked as replied",
      })
    }
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-6">
        <div className="max-w-md mx-auto mt-20">
          <div
            className="border border-pink-500/50 rounded-lg p-6 bg-slate-900/50"
            style={{
              boxShadow: "0 0 30px rgba(236, 72, 153, 0.3)",
            }}
          >
            <h1 className="text-2xl font-bold text-center mb-6">
              <span className="bg-gradient-to-r from-pink-500 to-amber-700 bg-clip-text text-transparent">
                Admin Dashboard
              </span>
            </h1>

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="bg-slate-800/50 border-pink-500/30 text-white"
              />
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-600 to-amber-900 hover:from-pink-500 hover:to-amber-800"
              >
                Access Dashboard
              </Button>
            </form>
          </div>
        </div>
      </main>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="border-b border-neon-pink/20 p-6">
        <h2 className="text-3xl font-bold text-neon-pink">Feedback Entries</h2>
        <p className="text-neon-cyan/60 text-sm mt-2">Review player feedback and mark responses</p>

        {/* Filter controls */}
        <div className="mt-4 flex flex-col md:flex-row gap-4">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full md:w-40 bg-slate-800/50 border-neon-cyan/30">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-neon-cyan/30">
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-full md:w-40 bg-slate-800/50 border-neon-cyan/30">
              <SelectValue placeholder="Filter by rating" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-neon-cyan/30">
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="1">1 Star</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl">
          {loading ? (
            <div className="text-center text-neon-cyan/50 py-8">Loading feedback...</div>
          ) : filteredFeedback.length === 0 ? (
            <div className="text-center text-neon-cyan/50 py-8">No feedback entries match filters</div>
          ) : (
            <div className="border border-neon-pink/20 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-neon-pink/20 bg-neon-pink/5 hover:bg-neon-pink/5">
                    <TableHead className="text-neon-pink">ID</TableHead>
                    <TableHead className="text-neon-pink">Wallet</TableHead>
                    <TableHead className="text-neon-pink">Message</TableHead>
                    <TableHead className="text-neon-pink">Rating</TableHead>
                    <TableHead className="text-neon-pink">Date</TableHead>
                    <TableHead className="text-neon-pink">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFeedback.map((entry) => (
                    <TableRow key={entry.id} className="border-neon-pink/10 hover:bg-neon-pink/5">
                      <TableCell className="text-neon-cyan/70 text-xs font-mono">{entry.id.slice(0, 8)}...</TableCell>
                      <TableCell className="text-neon-cyan/70 text-sm">
                        {entry.user_wallet ? `${entry.user_wallet.slice(0, 6)}...` : "Anonymous"}
                      </TableCell>
                      <TableCell className="text-neon-cyan max-w-xs truncate">{entry.message}</TableCell>
                      <TableCell className="text-neon-cyan">{entry.rating ? `${entry.rating}⭐` : "—"}</TableCell>
                      <TableCell className="text-neon-cyan/70 text-sm">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleToggleReplied(entry.id)}
                          className={
                            entry.replied
                              ? "bg-neon-lime/20 hover:bg-neon-lime/30 text-neon-lime border-neon-lime/30"
                              : "bg-neon-orange/20 hover:bg-neon-orange/30 text-neon-orange border-neon-orange/30"
                          }
                          variant="outline"
                        >
                          {entry.replied ? "✓ Replied" : "Pending"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
