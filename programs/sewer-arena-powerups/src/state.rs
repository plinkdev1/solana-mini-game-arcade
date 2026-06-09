use anchor_lang::prelude::*;

#[account]
pub struct GamePowerupState {
    pub game_id: String,
    pub powerup_triggered: bool,
    pub powerup_type: u8,
    pub requested_at: i64,
    pub applied_at: Option<i64>,
    pub rng_result: Option<u64>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct PowerupEffect {
    pub power_up_id: u8,
    pub name: String,
    pub description: String,
    pub cost: u64,
}

impl PowerupEffect {
    pub fn map_rng_to_powerup(rng: u64) -> Self {
        let powerup_id = (rng % 7) as u8;
        
        match powerup_id {
            0 => Self {
                power_up_id: 0,
                name: "Flush Strike".to_string(),
                description: "Remove 1 opponent piece".to_string(),
                cost: 15000000, // 0.015 SOL
            },
            1 => Self {
                power_up_id: 1,
                name: "Bandana Blind".to_string(),
                description: "Hide opponent move 1 turn".to_string(),
                cost: 10000000,
            },
            2 => Self {
                power_up_id: 2,
                name: "Poop Swirl Vortex".to_string(),
                description: "Swap 2 pieces".to_string(),
                cost: 20000000,
            },
            3 => Self {
                power_up_id: 3,
                name: "Plunger Pull".to_string(),
                description: "Pull opponent piece back 1 space".to_string(),
                cost: 12000000,
            },
            4 => Self {
                power_up_id: 4,
                name: "Reserve Hole Boost".to_string(),
                description: "Extra turn".to_string(),
                cost: 25000000,
            },
            5 => Self {
                power_up_id: 5,
                name: "Clog Jam".to_string(),
                description: "Block 1 grid space 1 turn".to_string(),
                cost: 10000000,
            },
            _ => Self {
                power_up_id: 6,
                name: "Neon Drip Hallucination".to_string(),
                description: "Rearrange 3 pieces".to_string(),
                cost: 18000000,
            },
        }
    }
}
