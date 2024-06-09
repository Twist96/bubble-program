use anchor_lang::prelude::*;
use anchor_spl::token::Mint;
use crate::errors::Errors;

#[account]
pub struct TokenWhitelist {
    pub tokens: Vec<Pubkey>
}

impl TokenWhitelist {
    pub const SEED: &'static str = "token_whitelist";
    pub const SIZE: usize = std::mem::size_of::<TokenWhitelist>();
}

pub trait WhitelistTokenAccount<'info> {
    fn insert_token(&mut self, token: &Account<'info, Mint>);
    fn remove_token(&mut self, token: &Account<'info, Mint>) -> Result<()>;

    fn check_token_exist(&mut self, token: &Account<'info, Mint>) -> Result<()>;
}
impl<'info> WhitelistTokenAccount<'info> for Account<'info, TokenWhitelist> {
    fn insert_token(&mut self, token: &Account<'info, Mint>) {
        self.tokens.push(token.key())
    }

    fn remove_token(&mut self, token: &Account<'info, Mint>) -> Result<()> {
        match self.check_token_exist(token) {
            Ok(_) => {
                self.tokens.retain(|key| key != &token.key());
                Ok(())
            }
            Err(error) => {
                Err(error)
            }
        }
    }

    fn check_token_exist(&mut self, token: &Account<'info, Mint>) -> Result<()> {
        if self.tokens.contains(&token.key()) {
            Ok(())
        } else {
            Err(Errors::InSufficientSol.into())
        }
    }
}