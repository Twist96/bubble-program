use anchor_lang::prelude::*;
use anchor_spl::token::Mint;
use crate::state::{TokenWhitelist, WhitelistTokenAccount};

#[derive(Accounts)]
pub struct WhitelistToken<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        mut,
        seeds = [TokenWhitelist::SEED.as_bytes()],
        bump
    )]
    pub whitelist: Account<'info, TokenWhitelist>,
    pub mint: Account<'info, Mint>
}

pub fn whitelist_token(ctx: Context<WhitelistToken>) -> Result<()> {
    ctx.accounts.whitelist.insert_token(&ctx.accounts.mint);
    Ok(())
}

