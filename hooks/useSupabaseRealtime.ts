"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

export function useSupabaseRealtime<T>(table: string, filter?: { column: string; value: string | number }) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        let query = supabase.from(table).select("*")

        if (filter) {
          query = query.eq(filter.column, filter.value)
        }

        const { data: fetchedData, error: fetchError } = await query
        if (fetchError) throw fetchError

        setData(fetchedData || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Fetch error")
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Setup realtime subscription
    const realtimeChannel = supabase
      .channel(`${table}_changes`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: table,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setData((prev) => [...prev, payload.new as T])
          } else if (payload.eventType === "UPDATE") {
            setData((prev) => prev.map((item: any) => (item.id === payload.new.id ? (payload.new as T) : item)))
          } else if (payload.eventType === "DELETE") {
            setData((prev) => prev.filter((item: any) => item.id !== payload.old.id))
          }
        },
      )
      .subscribe()

    setChannel(realtimeChannel)

    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel)
      }
    }
  }, [table, filter])

  return { data, loading, error, channel }
}
