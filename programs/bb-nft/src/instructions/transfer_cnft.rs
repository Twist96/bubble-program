use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;
use mpl_bubblegum::instructions::TransferCpiBuilder;
use spl_account_compression::Noop;
use spl_account_compression::program::SplAccountCompression;
use crate::MplBubblegum;
use crate::state::StakeInfo;

#[derive(Accounts)]
pub struct TransferCNFT<'info> {
    pub signer: Signer<'info>,
    pub destination: Account<'info, TokenAccount>,

    #[account(
    mut,
    seeds = [StakeInfo::SEED.as_ref(), nft.key.as_ref()],
    bump
    )]
    pub stake_info: Account<'info, StakeInfo>,

    /// CHECK: should be vetted from front end
    pub nft: UncheckedAccount<'info>,

    #[account(mut)]
    /// CHECK: This account is modified in the downstream program.
    pub tree_config: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: This account is modified in the downstream program.
    pub merkle_tree: UncheckedAccount<'info>,

    pub mpl_bubblegum_program: Program<'info, MplBubblegum>,
    pub log_wrapper: Program<'info, Noop>,
    pub compression_program: Program<'info, SplAccountCompression>,
    pub system_program: Program<'info, System>
}

pub fn transfer_cnft<'info>(
    ctx: Context<'_, '_, '_, 'info, TransferCNFT<'info>>,
    root: [u8; 32],
    data_hash: [u8; 32],
    creator_hash: [u8; 32],
    nonce: u64,
    index: u32
) -> Result<()> {
    require_keys_eq!(ctx.accounts.stake_info.owner, ctx.accounts.signer.key());

    //change stake ownership
    ctx.accounts.stake_info.owner = ctx.accounts.destination.key();

    //Transfer asset
    TransferCpiBuilder::new(&ctx.accounts.mpl_bubblegum_program)
        .tree_config(&ctx.accounts.tree_config)
        .leaf_owner(&ctx.accounts.signer, true)
        .leaf_delegate(&ctx.accounts.signer, false)
        .new_leaf_owner(&ctx.accounts.destination.to_account_info())
        .merkle_tree(&ctx.accounts.merkle_tree)
        .log_wrapper(&ctx.accounts.log_wrapper)
        .compression_program(&ctx.accounts.compression_program)
        .system_program(&ctx.accounts.system_program)
        .root(root)
        .data_hash(data_hash)
        .creator_hash(creator_hash)
        .nonce(nonce)
        .index(index)
        .add_remaining_accounts(
            &ctx.remaining_accounts
                .iter()
                .map(|account| (account, false, false))
                .collect::<Vec<(&AccountInfo, bool, bool)>>(),
        )
        .invoke()?;
    Ok(())
}