use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, transfer, Transfer, TokenAccount};
use crate::constants::*;
use crate::state::*;

#[derive(Accounts)]
pub struct UnlockFund<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    /// CHECK: should be vetted from front end
    /// ensure this nft is owned by the signer
    pub nft: UncheckedAccount<'info>,

    #[account(
    mut
    )]
    pub signer_usd_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [constants::NFT_USD_VAULT, nft.key.as_ref()],
        bump,
    )]
    pub usd_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [StakeInfo::SEED.as_ref(), nft.key.as_ref()],
        bump
    )]
    pub stake_info: Account<'info, StakeInfo>,

    pub usd_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>
}

pub fn unlock_fund(ctx: Context<UnlockFund>) -> Result<()> {
    //confirm nft owner; fetch nft
    require_keys_eq!(ctx.accounts.stake_info.owner, ctx.accounts.signer.key());
    // should be burnt first
    //transfer fund out of vault
    let signer: &[&[&[u8]]] = &[&[constants::NFT_USD_VAULT, ctx.accounts.nft.key.as_ref(), &[ctx.bumps.usd_vault]]];
    transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.usd_vault.to_account_info(),
                to: ctx.accounts.signer_usd_account.to_account_info(),
                authority: ctx.accounts.usd_vault.to_account_info()
            },
            signer
        ),
        ctx.accounts.usd_vault.amount
    )
}