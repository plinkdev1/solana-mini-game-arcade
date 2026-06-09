"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import type { User } from "@/lib/supabase/types"

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error: authError } = await supabase.auth.getUser()
        if (authError) throw authError

        if (data.user) {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", data.user.id)
            .single()

          if (userError && userError.code !== "PGRST116") throw userError
          setUser(userData || null)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Auth error")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: userData } = await supabase.from("users").select("*").eq("id", session.user.id).single()
        setUser(userData || null)
      } else {
        setUser(null)
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  return { user, loading, error }
}
