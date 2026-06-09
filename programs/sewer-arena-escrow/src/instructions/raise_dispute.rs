use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::GameEscrow;
use crate::errors::EscrowError;
use crate::events::DisputeRaisedEvent;

const DISPUTE_WINDOW: i64 = 24 * 60 * 60; // 24 hours in seconds
const DISPUTE_FEE: u64 = 50_000_000; // 0.05 $DATX in base units

#[derive(Accounts)]
pub struct RaiseDispute<'info> {
    #[account(mut)]
    pub escrow: Account<'info, GameEscrow>,
    #[account(mut)]
    pub disputer: Signer<'info>,
    #[account(mut)]
    pub disputer_token: Account<'info, TokenAccount>,
    #[account(mut)]
    pub treasury_token: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<RaiseDispute>) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow;
    
    require!(escrow.settle_proposed_winner.is_some(), EscrowError::NoSettleProposed);
    
    let time_since_proposal = Clock::get()?.unix_timestamp - escrow.settle_proposed_at.ok_or(EscrowError::NoSettleProposed)?;
    require!(time_since_proposal <= DISPUTE_WINDOW, EscrowError::DisputeWindowClosed);
    
    let proposed_winner = escrow.settle_proposed_winner.ok_or(EscrowError::NoSettleProposed)?;
    require!(
        ctx.accounts.disputer.key() == escrow.player1 || ctx.accounts.disputer.key() == escrow.player2,
        EscrowError::UnauthorizedPlayer
    );
    require!(
        ctx.accounts.disputer.key() != proposed_winner,
        EscrowError::WinnerCannotDispute
    );
    
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.disputer_token.to_account_info(),
                to: ctx.accounts.treasury_token.to_account_info(),
                authority: ctx.accounts.disputer.to_account_info(),
            },
        ),
        DISPUTE_FEE,
    )?;
    
    escrow.disputed = true;
    escrow.disputer = Some(*ctx.accounts.disputer.key());
    escrow.dispute_fee = DISPUTE_FEE;
    
    emit!(DisputeRaisedEvent {
        escrow: ctx.accounts.escrow.key(),
        game_id: escrow.game_id.clone(),
        disputer: *ctx.accounts.disputer.key(),
        dispute_fee: DISPUTE_FEE,
        timestamp: Clock::get()?.unix_timestamp,
    });
    
    msg!("Dispute raised by {} for game {}", ctx.accounts.disputer.key(), escrow.game_id);
    Ok(())
}
