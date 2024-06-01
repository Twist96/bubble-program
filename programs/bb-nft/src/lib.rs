mod instructions;
mod state;
mod constants;

use anchor_lang::prelude::*;
use crate::instructions::*;

declare_id!("23UbaEAHYvXWG3Af7BeVVsSDHfS3HcxHiWqSGrZR7S86");

#[derive(Clone)]
pub struct MplBubblegum;
impl Id for MplBubblegum {
    fn id() -> Pubkey {
        mpl_bubblegum::ID
    }
}

#[program]
pub mod bb_nft {
    use super::*;

    pub fn create_tree(ctx: Context<CreateTree>, max_depth: u32, max_buffer_size: u32) -> Result<()> {
        instructions::create_tree(ctx, max_depth, max_buffer_size)
    }

    pub fn mint_cnft(ctx: Context<MintCNFT>, symbol: String) -> Result<()> {
        instructions::mint_cnft(ctx, symbol)
    }

    pub fn burn_cnft<'info>(ctx: Context<'_, '_, '_, 'info, BurnCNFT<'info>>,
                     root: [u8; 32],
                     data_hash: [u8; 32],
                     creator_hash: [u8; 32],
                     nonce: u64,
                     index: u32) -> Result<()> {
        instructions::burn_cnft(ctx, root, data_hash, creator_hash, nonce, index)
    }

    pub fn transfer_cnft<'info>(
        ctx: Context<'_, '_, '_, 'info, TransferCNFT<'info>>,
        root: [u8; 32],
        data_hash: [u8; 32],
        creator_hash: [u8; 32],
        nonce: u64,
        index: u32
    ) -> Result<()> {
        instructions::transfer_cnft(ctx, root, data_hash, creator_hash, nonce, index)
    }

    pub fn lock_fund(ctx: Context<LockFund>, amount: u64) -> Result<()> {
        instructions::lock_fund(ctx, amount)
    }
}