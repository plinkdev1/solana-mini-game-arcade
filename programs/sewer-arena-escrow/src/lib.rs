use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

mod state;
mod errors;
mod events;
mod instructions;

use state::*;
use errors::*;
use events::*;
use instructions::*;

declare_id!("11111111111111111111111111111111");

const DATX_MINT: &str = "DatxPMjL2xixZavLQgVLKPVfAZjc4z9EHVHiXMf2cX5n";

#[program]
pub mod sewer_arena_escrow {
    use super::*;

    pub fn create_escrow(
        ctx: Context<CreateEscrow>,
        game_id: String,
        bet_amount: u64,
    ) -> Result<()> {
        instructions::create_escrow::handler(ctx, game_id, bet_amount)
    }

    pub fn deposit(
        ctx: Context<Deposit>,
        game_id: String,
    ) -> Result<()> {
        instructions::deposit::handler(ctx, game_id)
    }

    pub fn settle(
        ctx: Context<Settle>,
        game_id: String,
        winner: Pubkey,
    ) -> Result<()> {
        instructions::settle::handler(ctx, game_id, winner)
    }

    pub fn request_first_player(
        ctx: Context<RequestFirstPlayer>,
        game_id: String,
    ) -> Result<()> {
        instructions::request_first_player::handler(ctx, game_id)
    }

    pub fn request_powerup(
        ctx: Context<RequestPowerup>,
        game_id: String,
        requesting_player: Pubkey,
    ) -> Result<()> {
        instructions::request_powerup::handler(ctx, game_id, requesting_player)
    }

    pub fn raise_dispute(
        ctx: Context<RaiseDispute>,
    ) -> Result<()> {
        instructions::raise_dispute::handler(ctx)
    }

    pub fn resolve_dispute(
        ctx: Context<ResolveDispute>,
        final_winner: Pubkey,
        dispute_upheld: bool,
    ) -> Result<()> {
        instructions::resolve_dispute::handler(ctx, final_winner, dispute_upheld)
    }
}
