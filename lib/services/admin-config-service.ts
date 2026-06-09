import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export interface AdminConfig {
  network: "devnet" | "mainnet"
  mockModeOverride: boolean
  highRollerMinHold: number
}

// Fetch all admin config
export async function fetchAdminConfig(): Promise<AdminConfig> {
  const cookieStore = await cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => {},
    },
  })

  const { data, error } = await supabase.from("admin_config").select("key, value")

  if (error) {
    console.error("[v0] Admin config fetch error:", error)
    return getDefaultConfig()
  }

  const config: Partial<AdminConfig> = {}
  data?.forEach((row) => {
    if (row.key === "network") {
      config.network = row.value as "devnet" | "mainnet"
    } else if (row.key === "mock_mode_override") {
      config.mockModeOverride = row.value === "true"
    } else if (row.key === "high_roller_min_hold") {
      config.highRollerMinHold = Number.parseInt(row.value)
    }
  })

  return { ...getDefaultConfig(), ...config }
}

// Update single config value
export async function updateAdminConfig(key: string, value: string): Promise<void> {
  const cookieStore = await cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => {},
    },
  })

  const { error } = await supabase.from("admin_config").update({ value, updated_at: new Date() }).eq("key", key)

  if (error) {
    throw new Error(`Failed to update admin config: ${error.message}`)
  }
}

function getDefaultConfig(): AdminConfig {
  return {
    network: "devnet",
    mockModeOverride: false,
    highRollerMinHold: 100,
  }
}
