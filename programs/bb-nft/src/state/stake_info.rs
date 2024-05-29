use anchor_lang::prelude::*;

#[account]
pub struct StakeInfo {
    pub owner: Pubkey
}

impl StakeInfo {
    pub const SEED: &'static str = "stake_info";
    pub const SPACE: usize = 32 + 8;
}