import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Rate limit: 3 attempts per hour
const MAX_ATTEMPTS = 3
const LOCKOUT_DURATION_MS = 60 * 60 * 1000 // 1 hour

export async function POST(request: NextRequest) {
  try {
    const { wallet, password } = await request.json()

    if (!wallet || !password) {
      return NextResponse.json({ error: "Missing wallet or password" }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    })

    // Check rate limiting
    const { data: rateLimit } = await supabase.from("admin_rate_limits").select("*").eq("wallet", wallet).single()

    if (rateLimit) {
      if (rateLimit.locked_until && new Date(rateLimit.locked_until) > new Date()) {
        const remainingMins = Math.ceil((new Date(rateLimit.locked_until).getTime() - Date.now()) / 60000)

        await logAdminAction(supabase, wallet, "login_locked", { remaining_mins: remainingMins })

        return NextResponse.json({ error: `Too many attempts. Locked for ${remainingMins} minutes.` }, { status: 429 })
      }

      if (new Date(rateLimit.last_attempt).getTime() < Date.now() - LOCKOUT_DURATION_MS) {
        await supabase.from("admin_rate_limits").update({ attempts: 0, locked_until: null }).eq("wallet", wallet)
      }
    }

    // Verify wallet is in admin list (from Supabase table)
    const { data: adminWallet } = await supabase
      .from("admin_wallets")
      .select("wallet, active")
      .eq("wallet", wallet)
      .eq("active", true)
      .single()

    const envAdminWallets = (process.env.ADMIN_WALLETS || "").split(",").filter(Boolean)
    const isAdminWallet = adminWallet || envAdminWallets.includes(wallet)

    if (!isAdminWallet) {
      await incrementFailedAttempt(supabase, wallet)

      await logAdminAction(supabase, wallet, "login_unauthorized_wallet", {})

      return NextResponse.json({ error: "Wallet not authorized" }, { status: 403 })
    }

    // Verify password
    const correctPassword = process.env.ADMIN_PASSWORD || "flushadmin"
    const isMockMode = process.env.NEXT_PUBLIC_MOCK_WALLET === "true"
    const isValidPassword = password === correctPassword || (isMockMode && password === "test")

    if (!isValidPassword) {
      await incrementFailedAttempt(supabase, wallet)

      await logAdminAction(supabase, wallet, "login_invalid_password", {})

      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    // Reset rate limit on success
    await supabase.from("admin_rate_limits").upsert({
      wallet,
      attempts: 0,
      last_attempt: new Date().toISOString(),
      locked_until: null,
    })

    await logAdminAction(supabase, wallet, "login", { success: true })

    // Generate simple token
    const token = Buffer.from(
      JSON.stringify({
        wallet,
        exp: Date.now() + 60 * 60 * 1000, // 1 hour
        iat: Date.now(),
      }),
    ).toString("base64")

    return NextResponse.json({
      token,
      expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    })
  } catch (err) {
    console.error("[v0] Admin auth error:", err)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}

async function incrementFailedAttempt(supabase: any, wallet: string) {
  const { data: existing } = await supabase.from("admin_rate_limits").select("attempts").eq("wallet", wallet).single()

  const newAttempts = (existing?.attempts || 0) + 1
  const lockUntil = newAttempts >= MAX_ATTEMPTS ? new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString() : null

  await supabase.from("admin_rate_limits").upsert({
    wallet,
    attempts: newAttempts,
    last_attempt: new Date().toISOString(),
    locked_until: lockUntil,
  })
}

async function logAdminAction(supabase: any, wallet: string, action: string, details: object) {
  try {
    await supabase.from("admin_logs").insert({
      wallet,
      action,
      details,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    // Don't fail auth if logging fails
    console.error("[v0] Failed to log admin action:", err)
  }
}
