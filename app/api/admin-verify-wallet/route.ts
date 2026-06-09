import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Server-side wallet verification - ADMIN_WALLETS env var is only readable here
export async function POST(request: NextRequest) {
  try {
    const { wallet } = await request.json()

    if (!wallet) {
      return NextResponse.json({ permitted: false, error: "No wallet provided" }, { status: 400 })
    }

    // Check server-side env var (NOT exposed to client)
    const adminWalletsEnv = process.env.ADMIN_WALLETS || ""
    const adminWalletsList = adminWalletsEnv
      .split(",")
      .map((w) => w.trim().toLowerCase())
      .filter(Boolean)

    console.log("[v0] Admin wallets from env:", adminWalletsList.length, "wallets configured")
    console.log("[v0] Checking wallet:", wallet.toLowerCase())

    // Check against env var
    if (adminWalletsList.includes(wallet.toLowerCase())) {
      console.log("[v0] Wallet verified via ADMIN_WALLETS env var")
      return NextResponse.json({ permitted: true, source: "env" })
    }

    // Also check Supabase table as fallback
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      const { data, error } = await supabase
        .from("admin_wallets")
        .select("wallet, active")
        .eq("wallet", wallet)
        .eq("active", true)
        .single()

      if (data && !error) {
        console.log("[v0] Wallet verified via Supabase admin_wallets table")
        return NextResponse.json({ permitted: true, source: "supabase" })
      }

      if (error) {
        console.log("[v0] Supabase check error (may be RLS):", error.message)
      }
    }

    console.log("[v0] Wallet NOT permitted:", wallet)
    return NextResponse.json({ permitted: false, error: "Wallet not in admin list" })
  } catch (err) {
    console.error("[v0] Wallet verification error:", err)
    return NextResponse.json({ permitted: false, error: "Verification failed" }, { status: 500 })
  }
}
