use anchor_lang::prelude::*;

#[account]
pub struct Asset {
    pub id: Pubkey,
    pub name: String,
    pub metadata_url: String,
    pub price: u64,
    pub last_updated: u64,
    pub reputation: Reputation,
    pub authority: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub enum Reputation {
    Low,
    Medium,
    High,
}