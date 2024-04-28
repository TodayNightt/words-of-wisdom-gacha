pub mod error;

pub use error::{Error, Result};
use serde::Serialize;

#[derive(Clone, Debug, Serialize)]
pub struct Ctx {
    user_id: i64,
}

impl Ctx {
    pub fn user_id(&self) -> i64 {
        self.user_id
    }

    pub fn root_ctx() -> Self {
        Ctx { user_id: 0 }
    }

    pub fn visitor(user_id: i64) -> Result<Self> {
        if user_id == 0 {
            Err(Error::CtxVisitorCannotBeRoot)
        } else {
            Ok(Self { user_id })
        }
    }
}
