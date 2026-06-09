use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::*;
use crate::events::*;
use crate::errors::*;

#[derive(Accounts)]
#[instruction(game_id: String)]
pub struct Settle<'info> {
    #[account(
        mut,
        seeds = [b"escrow", escrow.player1.as_ref(), escrow.player2.as_ref(), game_id.as_bytes()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, GameEscrow>,

    pub admin: Signer<'info>,

    #[account(mut)]
    pub escrow_ata: Account<'info, TokenAccount>,

    #[account(mut)]
    pub winner_ata: Account<'info, TokenAccount>,

    #[account(mut)]
    pub treasury_ata: Account<'info, TokenAccount>,

    #[account(mut)]
    pub team_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(
    ctx: Context<Settle>,
    _game_id: String,
    winner: Pubkey,
) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow;

    require!(escrow.player1_deposited && escrow.player2_deposited, EscrowError::IncompleteDepsits);
    require!(!escrow.game_complete, EscrowError::AlreadySettled);
    require!(
        winner == escrow.player1 || winner == escrow.player2,
        EscrowError::InvalidWinner
    );

    let total_pot = escrow.bet_amount * 2;
    let winner_payout = (total_pot * 90) / 100;
    let treasury_rake = (total_pot * 7) / 100;
    let team_rake = (total_pot * 3) / 100;

    let seeds = &[
        b"escrow",
        escrow.player1.as_ref(),
        escrow.player2.as_ref(),
        escrow.game_id.as_bytes(),
        &[escrow.bump],
    ];
    let signer_seeds = &[&seeds[..]];

    // Transfer to winner
    let transfer_to_winner = Transfer {
        from: ctx.accounts.escrow_ata.to_account_info(),
        to: ctx.accounts.winner_ata.to_account_info(),
        authority: escrow.to_account_info(),
    };
    token::transfer(CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        transfer_to_winner,
        signer_seeds,
    ), winner_payout)?;

    // Transfer to treasury
    let transfer_to_treasury = Transfer {
        from: ctx.accounts.escrow_ata.to_account_info(),
        to: ctx.accounts.treasury_ata.to_account_info(),
        authority: escrow.to_account_info(),
    };
    token::transfer(CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        transfer_to_treasury,
        signer_seeds,
    ), treasury_rake)?;

    // Transfer to team
    let transfer_to_team = Transfer {
        from: ctx.accounts.escrow_ata.to_account_info(),
        to: ctx.accounts.team_ata.to_account_info(),
        authority: escrow.to_account_info(),
    };
    token::transfer(CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        transfer_to_team,
        signer_seeds,
    ), team_rake)?;

    escrow.game_complete = true;
    escrow.winner = Some(winner);
    escrow.settled_at = Some(Clock::get()?.unix_timestamp);

    emit!(SettleEvent {
        escrow: escrow.key(),
        winner,
        winner_payout,
        treasury: treasury_rake,
        team: team_rake,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}
