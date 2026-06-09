use anchor_lang::prelude::*;

#[account]
pub struct GameEscrow {
    pub game_id: String,
    pub player1: Pubkey,
    pub player2: Pubkey,
    pub bet_amount: u64,
    pub player1_deposited: bool,
    pub player2_deposited: bool,
    pub game_complete: bool,
    pub winner: Option<Pubkey>,
    pub created_at: i64,
    pub settled_at: Option<i64>,
    pub first_player: Option<u8>,
    pub vrf_pending: bool,
    pub vrf_request_time: i64,
    pub vrf_counter: u32,
    pub bump: u8,
    pub settle_proposed_winner: Option<Pubkey>,
    pub settle_proposed_at: Option<i64>,
    pub disputed: bool,
    pub disputer: Option<Pubkey>,
    pub dispute_fee: u64,
    pub settled: bool,
}

impl GameEscrow {
    pub const MAX_SIZE: usize = 8 + 32 + 32 + 32 + 8 + 1 + 1 + 1 + (1 + 32) + 8 + (1 + 8) + (1 + 1) + 1 + 8 + 4 + 1 + (1 + 32) + (1 + 8) + 1 + (1 + 32) + 8 + 1;
}
