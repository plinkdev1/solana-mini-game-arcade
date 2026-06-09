use anchor_lang::prelude::*;
use crate::state::*;
use crate::events::*;

#[derive(Accounts)]
pub struct RequestFirstPlayer<'info> {
    #[account(mut)]
    pub escrow: Account<'info, Escrow>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<RequestFirstPlayer>, game_id: String) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow;
    
    require!(escrow.game_id == game_id, EscrowError::GameIdMismatch);
    require!(!escrow.first_player_set, EscrowError::FirstPlayerAlreadySet);
    
    // Mark VRF request as pending
    escrow.vrf_pending = true;
    escrow.vrf_request_time = Clock::get()?.unix_timestamp;
    
    // Emit event for off-chain VRF request
    emit!(VRFRequestEvent {
        escrow: ctx.accounts.escrow.key(),
        game_id: game_id.clone(),
        request_type: "first_player".to_string(),
        timestamp: Clock::get()?.unix_timestamp,
    });
    
    Ok(())
}
