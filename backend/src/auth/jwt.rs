use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct TokenClaims {
    // Required (validate_exp defaults to true in validation). Expiration time (as UTC timestamp)
    exp: usize,
    // Optional. Issued at (as UTC timestamp)
    iat: usize,
    // // Optional. Subject (whom token refers to)
    sub: String,
}

impl TokenClaims {
    pub fn new(exp: usize, iat: usize, sub: String) -> Self {
        Self { exp, iat, sub }
    }

    pub fn subject(&self) -> String {
        self.sub.clone()
    }

    pub fn expiration(&self) -> usize {
        self.exp
    }
}
