"use server"

/**
 * Server-side admin verification
 * CRITICAL: This must remain server-side only to keep admin wallets private
 * Uses Supabase admin_wallets table with fallback to env var
 */

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function verifyAdminWallet(wallet: string): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    })

    // Check Supabase admin_wallets table first
    const { data: adminWallet } = await supabase
      .from("admin_wallets")
      .select("wallet, active")
      .eq("wallet", wallet)
      .eq("active", true)
      .single()

    if (adminWallet) {
      return true
    }

    // Fallback to env var (for initial setup before table is populated)
    const adminWallets = process.env.ADMIN_WALLETS || ""
    const adminList = adminWallets
      .split(",")
      .map((w) => w.trim())
      .filter(Boolean)

    return adminList.includes(wallet)
  } catch (error) {
    console.error("[v0] Admin wallet verification error:", error)

    // Fallback to env var on error
    const adminWallets = process.env.ADMIN_WALLETS || ""
    const adminList = adminWallets
      .split(",")
      .map((w) => w.trim())
      .filter(Boolean)

    return adminList.includes(wallet)
  }
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const correctPassword = process.env.ADMIN_PASSWORD || "flushadmin"

  // Mock mode bypass for testing
  const isMockMode = process.env.NEXT_PUBLIC_MOCK_WALLET === "true"
  if (isMockMode && password === "test") {
    return true
  }

  return password === correctPassword
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString())

    // Check expiration
    if (decoded.exp < Date.now()) {
      return false
    }

    // Verify wallet is still admin
    return await verifyAdminWallet(decoded.wallet)
  } catch {
    return false
  }
}
