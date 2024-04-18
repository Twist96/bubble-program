// use anchor_lang::prelude::*;
// use crate::state::Faucet;
//
//
// #[derive(Accounts)]
// pub struct CreateFaucet<'info> {
//     #[account(mut)]
//     pub payer: Signer<'info>,
//     #[account(
//         init,
//         space=Faucet::LEN,
//         payer=payer,
//         seeds=[payer.key().as_ref()],
//         bump
//     )]
//     pub faucet: Box<Account<'info, Faucet>>,
//     pub system_program: Program<'info, System>
// }
// pub fn create_faucet(ctx: Context<CreateFaucet>) -> Result<()> {
//     ctx.accounts.faucet.authority = ctx.accounts.payer.key();
//     ctx.accounts.faucet.merkel_tree = Pubkey::default();
//     ctx.accounts.faucet.current_supply = 0;
//     ctx.accounts.faucet.supply_cap = 1000;
//     ctx.accounts.faucet.bump = ctx.bumps.faucet;
//
//     Ok(())
// }