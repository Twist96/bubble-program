use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use crate::constants::*;
use crate::errors::Errors;
use crate::state::{StakeInfo, StakeInfoAccount, TokenWhitelist};

#[derive(Accounts)]
pub struct LockFund<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    /// CHECK: should be vetted from front end
    pub nft: UncheckedAccount<'info>,

    #[account(
        mut
    )]
    pub signer_usd_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        seeds = [constants::NFT_USD_VAULT, nft.key.as_ref()],
        bump,
        payer = signer,
        token::mint = usd_mint,
        token::authority = token_vault
    )]
    pub token_vault: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        seeds = [StakeInfo::SEED.as_ref(), nft.key.as_ref()],
        bump,
        space = StakeInfo::SPACE,
        payer = signer
    )]
    pub stake_info: Account<'info, StakeInfo>,

    #[account(
        seeds = [TokenWhitelist::SEED.as_bytes()],
        bump
    )]
    pub whitelist: Account<'info, TokenWhitelist>,

    pub usd_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>
}

pub fn lock_fund(ctx: Context<LockFund>, amount: u64) -> Result<()> {
    require!(ctx.accounts.whitelist.tokens.contains(&ctx.accounts.usd_mint.key()), Errors::TokenAlreadyWhitelisted);
    ctx.accounts.stake_info.lock_fund(
        amount,
        &ctx.accounts.signer,
        &ctx.accounts.signer_usd_account,
        &ctx.accounts.token_vault,
        &ctx.accounts.token_program
    )
}