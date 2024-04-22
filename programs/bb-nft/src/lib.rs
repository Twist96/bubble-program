mod instructions;
mod state;

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

    pub fn mint_cnft(ctx: Context<MintCNFT>, name: String, symbol: String, uri: String) -> Result<()> {
        instructions::mint_cnft(ctx, name, symbol, uri)
    }
}