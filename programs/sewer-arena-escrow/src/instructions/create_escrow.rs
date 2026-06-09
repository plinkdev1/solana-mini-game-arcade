use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount};
use crate::state::*;
use crate::events::*;

#[derive(Accounts)]
#[instruction(game_id: String)]
pub struct CreateEscrow<'info> {
    #[account(
        init,
        payer = player1,
        space = GameEscrow::MAX_SIZE,
        seeds = [b"escrow", player1.key().as_ref(), player2.key().as_ref(), game_id.as_bytes()],
        bump
    )]
    pub escrow: Account<'info, GameEscrow>,
    
    #[account(mut)]
    pub player1: Signer<'info>,
    
    pub player2: SystemAccount<'info>,
    
    #[account(
        init,
        payer = player1,
        associated_token::mint = token_mint,
        associated_token::authority = escrow
    )]
    pub escrow_ata: Account<'info, TokenAccount>,
    
    pub token_mint: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedTokenProgram>,
}

pub fn handler(
    ctx: Context<CreateEscrow>,
    game_id: String,
    bet_amount: u64,
) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow;
    escrow.game_id = game_id.clone();
    escrow.player1 = ctx.accounts.player1.key();
    escrow.player2 = ctx.accounts.player2.key();
    escrow.bet_amount = bet_amount;
    escrow.player1_deposited = false;
    escrow.player2_deposited = false;
    escrow.game_complete = false;
    escrow.winner = None;
    escrow.created_at = Clock::get()?.unix_timestamp;
    escrow.settled_at = None;
    escrow.bump = ctx.bumps.escrow;

    emit!(EscrowCreated {
        escrow: escrow.key(),
        game_id,
        player1: ctx.accounts.player1.key(),
        player2: ctx.accounts.player2.key(),
        bet_amount,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}
