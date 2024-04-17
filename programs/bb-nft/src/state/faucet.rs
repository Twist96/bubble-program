use anchor_lang::prelude::*;

#[account]
pub struct Faucet {
    pub authority: Pubkey,
    pub merkel_tree: Pubkey,
    pub current_supply: u64,
    pub supply_cap: u64,
    pub bump: u8
}

impl Faucet {
    pub const LEN: usize = 8
        + 32
        + 32
        + 8
        + 8
        + 1;
}