// New admin page for viewing all escrow events and settlements
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2 } from "lucide-react"

interface AuditEvent {
  id: string
  event_type: string
  event_data: any
  wallet1: string
  wallet2: string | null
  bet_amount: number | null
  outcome: string | null
  rake_treasury: number | null
  rake_team: number | null
  timestamp: string
}

export default function AdminTransactionsPage() {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "escrow" | "deposit" | "settle">("all")

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true)
      let query = supabase.from("game_audits").select("*").order("timestamp", { ascending: false }).limit(100)

      if (filter !== "all") {
        query = query.ilike("event_type", `%${filter}%`)
      }

      const { data, error } = await query

      if (error) {
        console.error("[v0] Error loading audit events:", error)
      } else {
        setEvents(data || [])
      }
      setLoading(false)
    }

    loadEvents()

    // Subscribe to realtime updates
    const subscription = supabase
      .channel("game_audits")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "game_audits" }, (payload) => {
        setEvents((prev) => [payload.new as AuditEvent, ...prev])
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [filter])

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-green-400">Escrow Audit Logs</h1>
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              className="neon-button"
            >
              All Events
            </Button>
            <Button
              variant={filter === "escrow" ? "default" : "outline"}
              onClick={() => setFilter("escrow")}
              className="neon-button"
            >
              Escrow Created
            </Button>
            <Button
              variant={filter === "deposit" ? "default" : "outline"}
              onClick={() => setFilter("deposit")}
              className="neon-button"
            >
              Deposits
            </Button>
            <Button
              variant={filter === "settle" ? "default" : "outline"}
              onClick={() => setFilter("settle")}
              className="neon-button"
            >
              Settlements
            </Button>
          </div>
        </div>

        <Card className="bg-gray-900 border-green-400">
          <CardHeader>
            <CardTitle className="text-green-400">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-green-400" />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No events found</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-green-400">
                      <TableHeader className="text-green-400">Event Type</TableHeader>
                      <TableHeader className="text-green-400">Player 1</TableHeader>
                      <TableHeader className="text-green-400">Player 2</TableHeader>
                      <TableHeader className="text-green-400">Bet Amount</TableHeader>
                      <TableHeader className="text-green-400">Treasury Rake</TableHeader>
                      <TableHeader className="text-green-400">Team Rake</TableHeader>
                      <TableHeader className="text-green-400">Outcome</TableHeader>
                      <TableHeader className="text-green-400">Timestamp</TableHeader>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id} className="border-gray-700 hover:bg-gray-800">
                        <TableCell className="text-green-400 font-mono text-sm">{event.event_type}</TableCell>
                        <TableCell className="text-gray-300 font-mono text-xs">
                          {event.wallet1?.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="text-gray-300 font-mono text-xs">
                          {event.wallet2?.slice(0, 8) || "-"}
                        </TableCell>
                        <TableCell className="text-yellow-400">
                          {event.bet_amount ? `${(event.bet_amount / 1e6).toFixed(2)} $DATX` : "-"}
                        </TableCell>
                        <TableCell className="text-purple-400">
                          {event.rake_treasury ? `${(event.rake_treasury / 1e6).toFixed(2)}` : "-"}
                        </TableCell>
                        <TableCell className="text-pink-400">
                          {event.rake_team ? `${(event.rake_team / 1e6).toFixed(2)}` : "-"}
                        </TableCell>
                        <TableCell className="text-green-300 text-xs">{event.outcome || "-"}</TableCell>
                        <TableCell className="text-gray-400 text-xs">
                          {new Date(event.timestamp).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
