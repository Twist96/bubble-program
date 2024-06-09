use anchor_lang::prelude::*;

#[error_code]
pub enum Errors {
    #[msg("Insufficient sol balance")]
    InSufficientSol,

    #[msg("Token already whitelisted")]
    TokenAlreadyWhitelisted,

    #[msg("Token is not whitelisted")]
    TokenNotWhitelisted
}