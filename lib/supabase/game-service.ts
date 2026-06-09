import { createBrowserClient } from "@supabase/ssr"

const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export interface GameMove {
  timestamp: string
  player: number
  action: string
  data: any
}

// Create a new game with proper initialization
export async function createGame(
  gameType: string,
  player1Id: string,
  player2Id: string | null,
  betAmount: number,
  aiMode = false,
) {
  try {
    const { data, error } = await supabase
      .from("games")
      .insert({
        game_type: gameType,
        player1_id: player1Id,
        player2_id: aiMode ? null : player2Id,
        bet_amount: betAmount,
        status: "active",
        started_at: new Date().toISOString(),
        moves: [],
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (err) {
    console.error("[v0] createGame error:", err)
    throw err
  }
}

// Record a move to the game state
export async function recordGameMove(gameId: string, playerNumber: number, move: any) {
  try {
    const { data: game, error: fetchError } = await supabase.from("games").select("moves").eq("id", gameId).single()

    if (fetchError) throw fetchError

    const moves = Array.isArray(game?.moves) ? game.moves : []
    const newMove: GameMove = {
      timestamp: new Date().toISOString(),
      player: playerNumber,
      action: move.action || "move",
      data: move.data || move,
    }

    const updatedMoves = [...moves, newMove]

    const { error: updateError } = await supabase.from("games").update({ moves: updatedMoves }).eq("id", gameId)

    if (updateError) throw updateError
    return updatedMoves
  } catch (err) {
    console.error("[v0] recordGameMove error:", err)
    throw err
  }
}

// End game and record result with proper leaderboard updates
export async function endGame(gameId: string, winnerId: string | null, loserIds: string[], betAmount: number) {
  try {
    // Update game status
    const { error: gameError } = await supabase
      .from("games")
      .update({
        status: "completed",
        ended_at: new Date().toISOString(),
        winner_id: winnerId,
      })
      .eq("id", gameId)

    if (gameError) throw gameError

    // Get game details for history logging
    const { data: game, error: gameDetailError } = await supabase
      .from("games")
      .select("game_type, player1_id, player2_id")
      .eq("id", gameId)
      .single()

    if (gameDetailError) throw gameDetailError

    // Calculate rake (10% split: 7% treasury, 3% team)
    const rakeTotal = betAmount * 0.1
    const rakeTreasury = rakeTotal * 0.7
    const rakeTeam = rakeTotal * 0.3

    // Log bet result and rake
    const { error: betError } = await supabase.from("bets").insert({
      game_id: gameId,
      player_id: winnerId,
      amount: betAmount,
      rake_treasury: rakeTreasury,
      rake_team: rakeTeam,
      status: winnerId ? "won" : "lost",
      tx_signature: `game_${gameId}`,
    })

    if (betError) throw betError

    // Log treasury distribution
    const { error: treasuryError } = await supabase.from("treasury_logs").insert({
      bet_id: gameId,
      treasury_amount: rakeTreasury,
      team_amount: rakeTeam,
      tx_signature: `game_${gameId}`,
    })

    if (treasuryError) throw treasuryError

    // Update leaderboards for all players
    const allPlayers = [game.player1_id, game.player2_id].filter(Boolean)

    for (const playerId of allPlayers) {
      const isWinner = playerId === winnerId

      const { data: currentLb } = await supabase.from("leaderboards").select("*").eq("user_id", playerId).single()

      if (currentLb) {
        await supabase
          .from("leaderboards")
          .update({
            wins: isWinner ? (currentLb.wins || 0) + 1 : currentLb.wins || 0,
            losses: !isWinner ? (currentLb.losses || 0) + 1 : currentLb.losses || 0,
            total_bet_won: isWinner ? (currentLb.total_bet_won || 0) + betAmount : currentLb.total_bet_won || 0,
            total_bet_lost: !isWinner ? (currentLb.total_bet_lost || 0) + betAmount : currentLb.total_bet_lost || 0,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", playerId)
      } else {
        await supabase.from("leaderboards").insert({
          user_id: playerId,
          wins: isWinner ? 1 : 0,
          losses: isWinner ? 0 : 1,
          total_bet_won: isWinner ? betAmount : 0,
          total_bet_lost: !isWinner ? betAmount : 0,
          rank: 0,
        })
      }
    }

    // Log game history
    for (const playerId of allPlayers) {
      await supabase.from("game_history").insert({
        user_id: playerId,
        game_id: gameId,
        game_type: game.game_type,
        opponent_id: playerId === game.player1_id ? game.player2_id : game.player1_id,
        bet_amount: betAmount,
        rake_paid: rakeTotal,
        result: playerId === winnerId ? "win" : "loss",
      })
    }

    return { success: true, rakeTotal }
  } catch (err) {
    console.error("[v0] endGame error:", err)
    throw err
  }
}

// Subscribe to game updates with proper channel name
export function subscribeToGame(gameId: string, callback: (data: any) => void) {
  const channel = supabase
    .channel(`game:${gameId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "games",
        filter: `id=eq.${gameId}`,
      },
      (payload) => {
        callback(payload.new)
      },
    )
    .subscribe()

  return channel
}

// Broadcast a move for realtime sync
export async function broadcastMove(gameId: string, move: any) {
  try {
    const channel = supabase.channel(`game:${gameId}`)
    await channel.send({
      type: "broadcast",
      event: "move",
      payload: move,
    })
  } catch (err) {
    console.error("[v0] broadcastMove error:", err)
  }
}

export async function updateGameResult(gameId: string, winnerId: string | null, moves: any[], rakeAmount: number) {
  try {
    // Use the new endGame flow, passing empty loserIds since old code doesn't provide them
    const loserIds: string[] = []
    return await endGame(gameId, winnerId, loserIds, rakeAmount)
  } catch (err) {
    console.error("[v0] updateGameResult (legacy) error:", err)
    throw err
  }
}
