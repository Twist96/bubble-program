use anchor_lang::prelude::*;
use anchor_spl::token;
use anchor_spl::token::{Mint, Token, transfer, Transfer, TokenAccount};
use crate::constants::*;

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
        token::authority = usd_vault
    )]
    pub usd_vault: Account<'info, TokenAccount>,

    pub usd_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>
}

pub fn lock_fund(ctx: Context<LockFund>, amount: u64) -> Result<()> {
    //transfer fund
    transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.signer_usd_account.to_account_info(),
                to: ctx.accounts.usd_vault.to_account_info(),
                authority: ctx.accounts.signer.to_account_info()
            },
        ),
        amount
    )

    //update nft: set lock fund to true
}