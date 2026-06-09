use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::GameEscrow;
use crate::errors::EscrowError;
use crate::events::DisputeResolvedEvent;

const ADMIN_PUBKEY: &str = "YourAdminWalletAddressHere11111111111111111"; // Replace with actual admin wallet or multisig

#[derive(Accounts)]
pub struct ResolveDispute<'info> {
    #[account(mut)]
    pub escrow: Account<'info, GameEscrow>,
    #[account(mut)]
    pub winner_token: Account<'info, TokenAccount>,
    #[account(mut)]
    pub escrow_token: Account<'info, TokenAccount>,
    #[account(mut)]
    pub treasury_token: Account<'info, TokenAccount>,
    #[account(mut)]
    pub team_token: Account<'info, TokenAccount>,
    #[account(mut)]
    pub disputer_token: Option<Account<'info, TokenAccount>>,
    #[account(signer)]
    /// Admin wallet for dispute resolution
    pub admin: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<ResolveDispute>, final_winner: Pubkey, dispute_upheld: bool) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow;
    
    require!(
        ctx.accounts.admin.key().to_string() == ADMIN_PUBKEY.to_string(),
        EscrowError::UnauthorizedAdmin
    );
    
    require!(escrow.disputed, EscrowError::NotDisputed);
    
    require!(
        final_winner == escrow.player1 || final_winner == escrow.player2,
        EscrowError::InvalidWinner
    );
    
    let total_pot = escrow.bet_amount.checked_mul(2).ok_or(EscrowError::InsufficientFunds)?;
    let rake = total_pot / 10;
    let winner_amount = total_pot - rake;
    let rake_treasury = rake * 7 / 10;
    let rake_team = rake - rake_treasury;
    
    let seeds = &[
        b"escrow",
        escrow.game_id.as_bytes(),
        &[escrow.bump],
    ];
    let signer_seeds = &[&seeds[..]];
    
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.escrow_token.to_account_info(),
                to: ctx.accounts.winner_token.to_account_info(),
                authority: ctx.accounts.escrow.to_account_info(),
            },
            signer_seeds,
        ),
        winner_amount,
    )?;
    
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.escrow_token.to_account_info(),
                to: ctx.accounts.treasury_token.to_account_info(),
                authority: ctx.accounts.escrow.to_account_info(),
            },
            signer_seeds,
        ),
        rake_treasury,
    )?;
    
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.escrow_token.to_account_info(),
                to: ctx.accounts.team_token.to_account_info(),
                authority: ctx.accounts.escrow.to_account_info(),
            },
            signer_seeds,
        ),
        rake_team,
    )?;
    
    let fee_refunded = if dispute_upheld {
        if let Some(disputer_token) = &ctx.accounts.disputer_token {
            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.treasury_token.to_account_info(),
                        to: disputer_token.to_account_info(),
                        authority: ctx.accounts.admin.to_account_info(),
                    },
                    signer_seeds,
                ),
                escrow.dispute_fee,
            )?;
            true
        } else {
            false
        }
    } else {
        false
    };
    
    escrow.settled = true;
    escrow.winner = Some(final_winner);
    escrow.settled_at = Some(Clock::get()?.unix_timestamp);
    
    emit!(DisputeResolvedEvent {
        escrow: ctx.accounts.escrow.key(),
        game_id: escrow.game_id.clone(),
        final_winner,
        dispute_upheld,
        fee_refunded,
        timestamp: Clock::get()?.unix_timestamp,
    });
    
    msg!("Dispute resolved: Winner {} | Upheld: {} | Fee Refunded: {}", final_winner, dispute_upheld, fee_refunded);
    Ok(())
}
