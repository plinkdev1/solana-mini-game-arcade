/// <reference lib="deno.window" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0"
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { Deno } from "https://deno.land/std@0.177.0/node/globals.ts"

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!)

interface SettleBetPayload {
  gameId: string
  winnerId: string
  loserId: string
  betAmount: number
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
    })
  }

  try {
    const payload: SettleBetPayload = await req.json()
    const { gameId, winnerId, loserId, betAmount } = payload

    // Calculate rake: 10% split (7% treasury, 3% team)
    const totalRake = betAmount * 0.1
    const treasuryRake = totalRake * 0.7
    const teamRake = totalRake * 0.3
    const winnerAmount = betAmount * 0.9

    // Update winner balance
    await supabase.rpc("update_user_balance", {
      user_id: winnerId,
      amount: winnerAmount,
    })

    // Log treasury transaction
    await supabase.from("treasury_logs").insert({
      bet_id: gameId,
      treasury_amount: treasuryRake,
      team_amount: teamRake,
      tx_signature: `mock_${Date.now()}`,
    })

    // Update bet status
    await supabase
      .from("bets")
      .update({
        status: "settled",
        rake_treasury: treasuryRake,
        rake_team: teamRake,
      })
      .eq("game_id", gameId)

    return new Response(
      JSON.stringify({
        success: true,
        winnerId,
        winnerAmount,
        treasuryRake,
        teamRake,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      },
    )
  }
})
