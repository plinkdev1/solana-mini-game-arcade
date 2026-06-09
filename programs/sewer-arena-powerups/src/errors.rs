use anchor_lang::prelude::*;

#[error_code]
pub enum PowerupError {
    #[msg("Invalid oracle signature")]
    InvalidOracleSignature,
    
    #[msg("Power-up already triggered for this game")]
    PowerupAlreadyTriggered,
    
    #[msg("Game not found")]
    GameNotFound,
    
    #[msg("Insufficient funds for oracle callback")]
    InsufficientFunds,
}
