import type { Connection } from "@solana/web3.js"
import { EventParser } from "@project-serum/anchor"
import { SEWER_ARENA_ESCROW_PROGRAM_ID } from "./escrow-client"
import { supabase } from "@/lib/supabase/client"
import { anchor, IDL } from "./anchor-program" // Import anchor and IDL

// Event types matching Anchor program
export interface EscrowCreatedEvent {
  escrow: string
  game_id: string
  player1: string
  player2: string
  bet_amount: bigint
  timestamp: bigint
}

export interface DepositEventData {
  escrow: string
  player: string
  amount: bigint
  timestamp: bigint
}

export interface SettleEventData {
  escrow: string
  winner: string
  winner_payout: bigint
  treasury: bigint
  team: bigint
  timestamp: bigint
}

export class EscrowEventSubscriber {
  private connection: Connection
  private eventParser: EventParser
  private subscriptionId: number | null = null

  constructor(connection: Connection) {
    this.connection = connection
    this.eventParser = new EventParser(SEWER_ARENA_ESCROW_PROGRAM_ID, new anchor.Program(IDL))
  }

  // Subscribe to all program events and log to Supabase
  async subscribe(onEvent: (eventType: string, data: any) => void) {
    this.subscriptionId = this.connection.onProgramAccountChange(SEWER_ARENA_ESCROW_PROGRAM_ID, async (accountInfo) => {
      try {
        const events = this.eventParser.parseLogs(accountInfo.data)
        for (const event of events) {
          await this.logEventToSupabase(event.name, event.data)
          onEvent(event.name, event.data)
        }
      } catch (error) {
        console.error("[v0] Error parsing program events:", error)
      }
    })
  }

  // Log event to Supabase game_audits table
  private async logEventToSupabase(eventType: string, eventData: any) {
    try {
      const { error } = await supabase.from("game_audits").insert({
        event_type: eventType,
        event_data: eventData,
        escrow_pda: eventData.escrow,
        match_id: eventData.game_id || null,
        wallet1: eventData.player1 || eventData.winner || null,
        wallet2: eventData.player2 || null,
        bet_amount: eventData.bet_amount ? Number(eventData.bet_amount) : null,
        outcome: eventType === "SettleEvent" ? `winner: ${eventData.winner}` : null,
        rake_treasury: eventData.treasury ? Number(eventData.treasury) : null,
        rake_team: eventData.team ? Number(eventData.team) : null,
        tx_sigs: { event_type: eventType },
        timestamp: new Date(Number(eventData.timestamp) * 1000),
      })

      if (error) {
        console.error("[v0] Error logging event to Supabase:", error)
      }
    } catch (error) {
      console.error("[v0] Error in logEventToSupabase:", error)
    }
  }

  unsubscribe() {
    if (this.subscriptionId !== null) {
      this.connection.removeProgramAccountChangeListener(this.subscriptionId)
    }
  }
}
