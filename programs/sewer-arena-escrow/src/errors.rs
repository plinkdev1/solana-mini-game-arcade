use anchor_lang::prelude::*;

#[error_code]
pub enum EscrowError {
    #[msg("Only player1 or player2 can deposit")]
    UnauthorizedDeposit,
    #[msg("Both players must deposit before settlement")]
    IncompleteDepsits,
    #[msg("Game already settled")]
    AlreadySettled,
    #[msg("Invalid winner - must be player1 or player2")]
    InvalidWinner,
    #[msg("Insufficient funds for bet")]
    InsufficientFunds,
    #[msg("Game ID mismatch")]
    GameIdMismatch,
    #[msg("First player already set")]
    FirstPlayerAlreadySet,
    #[msg("Game is not complete")]
    GameNotComplete,
    #[msg("Unauthorized player")]
    UnauthorizedPlayer,
    #[msg("Game already complete")]
    GameAlreadyComplete,
    #[msg("VRF request still pending")]
    VRFStillPending,
    #[msg("No settle proposed yet")]
    NoSettleProposed,
    #[msg("Dispute window has closed (24 hours)")]
    DisputeWindowClosed,
    #[msg("Winner cannot dispute their own settlement")]
    WinnerCannotDispute,
    #[msg("Dispute not found or already resolved")]
    NotDisputed,
    #[msg("Only admin can resolve disputes")]
    UnauthorizedAdmin,
    #[msg("Insufficient dispute fee")]
    InsufficientDisputeFee,
}
