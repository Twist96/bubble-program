use anchor_lang::prelude::*;
use mpl_bubblegum::instructions::MintV1CpiBuilder;
use mpl_bubblegum::types::{MetadataArgs, TokenProgramVersion, TokenStandard};
use spl_account_compression::{program::SplAccountCompression, Noop};
use crate::{MplBubblegum};

pub fn mint_cnft(ctx: Context<MintCNFT>, name: String, symbol: String, uri: String) -> Result<()> {
    let metadata = MetadataArgs {
        name,
        uri,
        symbol,
        edition_nonce: None,
        is_mutable: true,
        primary_sale_happened: true,
        seller_fee_basis_points: 500,
        token_program_version: TokenProgramVersion::Original,
        token_standard: Some(TokenStandard::NonFungible),
        collection: None,
        uses: None,
        creators: vec![]
    };

    MintV1CpiBuilder::new(&ctx.accounts.mpl_bubblegum_program)
        .tree_config(&ctx.accounts.tree_config)
        .leaf_owner(&ctx.accounts.signer)
        .leaf_delegate(&ctx.accounts.signer)
        .merkle_tree(&ctx.accounts.merkle_tree)
        .payer(&ctx.accounts.signer)
        .tree_creator_or_delegate(&ctx.accounts.tree_owner)
        .log_wrapper(&ctx.accounts.log_wrapper)
        .compression_program(&ctx.accounts.compression_program)
        .system_program(&ctx.accounts.system_program)
        .metadata(metadata)
        .invoke_signed(&[&[
            b"tree_owner",
            ctx.accounts.merkle_tree.key().as_ref(),
            &[ctx.bumps.tree_owner]
        ]])?;
    Ok(())
}

#[derive(Accounts)]
pub struct MintCNFT<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut)]
    /// CHECK: This account is modified in the downstream program.
    pub tree_config: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: This account is modified in the downstream program.
    pub merkle_tree: UncheckedAccount<'info>,
    #[account(
        seeds = [b"tree_owner", merkle_tree.key().as_ref()],
        bump
    )]
    /// CHECK: This account used as a signing PDA only
    pub tree_owner: UncheckedAccount<'info>,
    pub mpl_bubblegum_program: Program<'info, MplBubblegum>,
    pub log_wrapper: Program<'info, Noop>,
    pub compression_program: Program<'info, SplAccountCompression>,
    pub system_program: Program<'info, System>


}