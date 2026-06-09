import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const ADMIN_WALLETS = (process.env.ADMIN_WALLETS || "").split(",").filter(Boolean)

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    })

    const { data, error } = await supabase.from("admin_config").select("key, value")

    if (error) throw error

    const config: Record<string, string> = {}
    data?.forEach((row) => {
      config[row.key] = row.value
    })

    return NextResponse.json({
      network: config.network || "devnet",
      mockModeOverride: config.mock_mode_override === "true",
      highRollerMinHold: Number.parseInt(config.high_roller_min_hold || "100"),
    })
  } catch (err) {
    console.error("[v0] Admin config fetch error:", err)
    return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminPassword = request.headers.get("x-admin-password")
    const adminWallet = request.headers.get("x-admin-wallet")

    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!adminWallet || !ADMIN_WALLETS.includes(adminWallet)) {
      return NextResponse.json({ error: "Admin wallet not authorized" }, { status: 403 })
    }

    const { key, value } = await request.json()

    if (!key || value === undefined) {
      return NextResponse.json({ error: "Missing key or value" }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    })

    const { error } = await supabase.from("admin_config").update({ value, updated_at: new Date() }).eq("key", key)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[v0] Admin config update error:", err)
    return NextResponse.json({ error: "Failed to update config" }, { status: 500 })
  }
}
