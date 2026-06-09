use anchor_lang::prelude::*;

#[event]
pub struct EscrowCreated {
    pub escrow: Pubkey,
    pub game_id: String,
    pub player1: Pubkey,
    pub player2: Pubkey,
    pub bet_amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct DepositEvent {
    pub escrow: Pubkey,
    pub player: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct SettleEvent {
    pub escrow: Pubkey,
    pub winner: Pubkey,
    pub winner_payout: u64,
    pub treasury: u64,
    pub team: u64,
    pub timestamp: i64,
}

#[event]
pub struct VRFRequestEvent {
    pub escrow: Pubkey,
    pub game_id: String,
    pub request_type: String,
    pub timestamp: i64,
}

#[event]
pub struct VRFResultEvent {
    pub escrow: Pubkey,
    pub game_id: String,
    pub randomness: u64,
    pub first_player: u8,
    pub timestamp: i64,
}

#[event]
pub struct PowerupTriggeredEvent {
    pub escrow: Pubkey,
    pub game_id: String,
    pub powerup_type: u8,
    pub cost_sol: u64,
    pub timestamp: i64,
}

#[event]
pub struct DisputeRaisedEvent {
    pub escrow: Pubkey,
    pub game_id: String,
    pub disputer: Pubkey,
    pub dispute_fee: u64,
    pub timestamp: i64,
}

#[event]
pub struct DisputeResolvedEvent {
    pub escrow: Pubkey,
    pub game_id: String,
    pub final_winner: Pubkey,
    pub dispute_upheld: bool,
    pub fee_refunded: bool,
    pub timestamp: i64,
}
