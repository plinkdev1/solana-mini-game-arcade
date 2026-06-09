use anchor_lang::prelude::*;
use crate::state::{GamePowerupState, PowerupEffect};
use crate::errors::PowerupError;

pub fn apply_powerup(
    ctx: Context<super::ApplyPowerup>,
    game_id: String,
    rng_result: u64,
) -> Result<()> {
    require!(
        !ctx.accounts.game_state.powerup_triggered,
        PowerupError::PowerupAlreadyTriggered
    );

    let powerup = PowerupEffect::map_rng_to_powerup(rng_result);
    
    ctx.accounts.game_state.powerup_triggered = true;
    ctx.accounts.game_state.powerup_type = powerup.power_up_id;
    ctx.accounts.game_state.rng_result = Some(rng_result);
    ctx.accounts.game_state.applied_at = Some(Clock::get()?.unix_timestamp);

    msg!("🎪 El Shito strikes! {} activated!", powerup.name);
    
    Ok(())
}
