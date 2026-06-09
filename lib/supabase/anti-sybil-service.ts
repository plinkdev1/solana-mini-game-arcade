import { supabase } from "@/lib/supabase/client"

export interface AntiSybilStatus {
  walletVerified: boolean
  captchaCompleted: boolean
  canPlay: boolean
  reasons: string[]
}

export async function checkAntiSybilRequirements(walletAddress: string): Promise<AntiSybilStatus> {
  const reasons: string[] = []
  let canPlay = true

  try {
    // Check if wallet is unique (not already in system)
    const { data: existingUsers, error: queryError } = await supabase
      .from("users")
      .select("id, wallet_verified, captcha_completed")
      .eq("wallet_address", walletAddress)

    if (queryError) throw queryError

    let walletVerified = false
    let captchaCompleted = false

    if (existingUsers && existingUsers.length > 0) {
      walletVerified = existingUsers[0].wallet_verified || false
      captchaCompleted = existingUsers[0].captcha_completed || false
    } else {
      // New wallet - needs verification
      canPlay = false
      reasons.push("New wallet detected - CAPTCHA verification required")
    }

    if (!captchaCompleted && existingUsers?.length > 0) {
      canPlay = false
      reasons.push("CAPTCHA verification not completed")
    }

    return {
      walletVerified,
      captchaCompleted,
      canPlay,
      reasons,
    }
  } catch (error) {
    console.error("[v0] Anti-Sybil check error:", error)
    return {
      walletVerified: false,
      captchaCompleted: false,
      canPlay: false,
      reasons: ["Anti-Sybil check failed"],
    }
  }
}

export async function completeCaptchaVerification(walletAddress: string): Promise<boolean> {
  try {
    // Mark wallet as verified and CAPTCHA completed
    const { error } = await supabase
      .from("users")
      .update({
        wallet_verified: true,
        captcha_completed: true,
        last_captcha_time: new Date().toISOString(),
      })
      .eq("wallet_address", walletAddress)

    if (error) throw error
    return true
  } catch (error) {
    console.error("[v0] CAPTCHA completion error:", error)
    return false
  }
}
