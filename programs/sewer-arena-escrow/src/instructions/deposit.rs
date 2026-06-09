use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::*;
use crate::events::*;
use crate::errors::*;

#[derive(Accounts)]
#[instruction(game_id: String)]
pub struct Deposit<'info> {
    #[account(
        mut,
        seeds = [b"escrow", escrow.player1.as_ref(), escrow.player2.as_ref(), game_id.as_bytes()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, GameEscrow>,

    #[account(mut)]
    pub player: Signer<'info>,

    #[account(mut)]
    pub player_ata: Account<'info, TokenAccount>,

    #[account(mut)]
    pub escrow_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(
    ctx: Context<Deposit>,
    _game_id: String,
) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow;
    let player = ctx.accounts.player.key();

    require!(
        player == escrow.player1 || player == escrow.player2,
        EscrowError::UnauthorizedDeposit
    );

    require!(
        ctx.accounts.player_ata.amount >= escrow.bet_amount,
        EscrowError::InsufficientFunds
    );

    let cpi_accounts = Transfer {
        from: ctx.accounts.player_ata.to_account_info(),
        to: ctx.accounts.escrow_ata.to_account_info(),
        authority: ctx.accounts.player.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

    token::transfer(cpi_ctx, escrow.bet_amount)?;

    if player == escrow.player1 {
        escrow.player1_deposited = true;
    } else {
        escrow.player2_deposited = true;
    }

    emit!(DepositEvent {
        escrow: escrow.key(),
        player,
        amount: escrow.bet_amount,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}
