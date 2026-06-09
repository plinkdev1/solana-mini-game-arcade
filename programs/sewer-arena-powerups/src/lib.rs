use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;
pub mod errors;

use instructions::*;
use state::*;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod sewer_arena_powerups {
    use super::*;

    /// Request a power-up from Switchboard oracle
    pub fn request_powerup(ctx: Context<RequestPowerup>, game_id: String) -> Result<()> {
        instructions::request_powerup(ctx, game_id)
    }

    /// Apply power-up after receiving oracle callback
    pub fn apply_powerup(
        ctx: Context<ApplyPowerup>,
        game_id: String,
        rng_result: u64,
    ) -> Result<()> {
        instructions::apply_powerup(ctx, game_id, rng_result)
    }
}

#[derive(Accounts)]
pub struct RequestPowerup<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
    pub switchboard_program: Program<'info, switchboard_v2::program::SwitchboardProgram>,
}

#[derive(Accounts)]
pub struct ApplyPowerup<'info> {
    #[account(mut)]
    pub game_state: Account<'info, GamePowerupState>,
    
    pub oracle_feed: AccountInfo<'info>,
    pub signer: Signer<'info>,
}
