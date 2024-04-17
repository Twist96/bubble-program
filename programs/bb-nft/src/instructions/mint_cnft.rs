use std::str::FromStr;
use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;
use mpl_bubblegum::instructions::MintV1CpiBuilder;
use mpl_bubblegum::types::{Creator, MetadataArgs, TokenProgramVersion, TokenStandard};
use crate::{MplBubblegum, Noop};
use crate::state::Faucet;

#[derive(Accounts)]
pub struct MintCNFT<'info> {
    #[account(mut)]
    payer: Signer<'info>,
    /// CHECK: this will be addressed from backend
    tree_config: UncheckedAccount<'info>,
    /// CHECK: this will be addressed from backend
    leaf_owner: AccountInfo<'info>,
    merkle_tree: Account<'info, TokenAccount>,
    faucet: Account<'info, Faucet>,

    log_wrapper: Program<'info, Noop>,
    bubblegum: Program<'info, MplBubblegum>,
    compression_program: Program<'info, System>,
    system_program: Program<'info, System>
}

pub fn mint_cnft(ctx:Context<MintCNFT>) -> Result<()> {
    let meta_data = MetadataArgs {
        name: String::from("First Mint"),
        symbol: String::from("FstM"),
        uri: String::from("https://lavender-following-rabbit-173.mypinata.cloud/ipfs/QmSrSw8H3DUTVWzcAyZY1pQzcQFh9zxCVsHwn3aWU9exLr"),
        seller_fee_basis_points: 0,
        primary_sale_happened: false,
        is_mutable: false,
        edition_nonce: None,
        token_standard: TokenStandard::NonFungible.into(),
        collection: None,
        uses: None,
        token_program_version: TokenProgramVersion::Original,
        creators: vec![Creator{
            address: Pubkey::from_str("").unwrap(),
            verified: false,
            share: 100,
        }]
    };

   MintV1CpiBuilder::new(&ctx.accounts.bubblegum.to_account_info())
        .tree_config(&ctx.accounts.tree_config.to_account_info())
        .leaf_owner(&ctx.accounts.leaf_owner.to_account_info())
        .leaf_delegate(&ctx.accounts.leaf_owner.to_account_info())
        .merkle_tree(&ctx.accounts.merkle_tree.to_account_info())
        .payer(&ctx.accounts.payer.to_account_info())
        .tree_creator_or_delegate(&ctx.accounts.faucet.to_account_info())
        .log_wrapper(&ctx.accounts.log_wrapper.to_account_info())
        .compression_program(&ctx.accounts.compression_program.to_account_info())
        .system_program(&ctx.accounts.system_program.to_account_info())
        .metadata(meta_data)
        .invoke_signed(&[&[b""]])?;

    Ok(())
}