use anchor_lang::prelude::*;
use anchor_spl::token::{TokenAccount, transfer, Transfer, Token};
use crate::constants::constants;

#[account]
pub struct StakeInfo {
    pub owner: Pubkey
}

impl StakeInfo {
    pub const SEED: &'static str = "stake_info";
    pub const SPACE: usize = 32 + 8;
}

pub trait StakeInfoAccount<'info> {
    fn lock_fund(&mut self,
                 amount: u64,
                 signer: &Signer<'info>,
                 signer_token_account: &Account<'info, TokenAccount>,
                 token_vault: &Account<'info, TokenAccount>,
                 token_program: &Program<'info, Token>) -> Result<()>;

    fn unlock_fund(&mut self,
                   usd_vault_bump: u8,
                   usd_vault: &Account<'info, TokenAccount>,
                   signer: &Signer<'info>,
                   signer_usd_account: &Account<'info, TokenAccount>,
                   cnft: &UncheckedAccount<'info>,
                   token_program: &Program<'info, Token>) -> Result<()>;
}

impl<'info> StakeInfoAccount<'info> for Account<'info, StakeInfo> {
    fn lock_fund(&mut self,
                 amount: u64,
                 signer: &Signer<'info>,
                 from: &Account<'info, TokenAccount>,
                 to: &Account<'info, TokenAccount>,
                 token_program: &Program<'info, Token>
    ) -> Result<()> {
        transfer(
            CpiContext::new(
                token_program.to_account_info(),
                Transfer {
                    from: from.to_account_info(),
                    to: to.to_account_info(),
                    authority: signer.to_account_info()
                },
            ),
            amount
        )?;

        self.owner = from.key();
        Ok(())
    }

    fn unlock_fund(&mut self,
                   usd_vault_bump: u8,
                   usd_vault: &Account<'info, TokenAccount>,
                   signer: &Signer<'info>,
                   signer_usd_account: &Account<'info, TokenAccount>,
                   cnft: &UncheckedAccount<'info>,
                   token_program: &Program<'info, Token>
    ) -> Result<()> {
        require_keys_eq!(self.owner, signer.key());

        let signer: &[&[&[u8]]] = &[&[constants::NFT_USD_VAULT, cnft.key.as_ref(), &[usd_vault_bump]]];
        transfer(
            CpiContext::new_with_signer(
                token_program.to_account_info(),
                Transfer {
                    from: usd_vault.to_account_info(),
                    to: signer_usd_account.to_account_info(),
                    authority: usd_vault.to_account_info()
                },
                signer
            ),
            usd_vault.amount
        )
    }
}