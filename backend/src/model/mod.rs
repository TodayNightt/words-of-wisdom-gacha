use std::sync::Arc;

pub use error::{Error, Result};
use sqids::Sqids;

use crate::config::config;

use collection::CollectionBmc;
use fortune::FortuneBmc;

mod collection;
mod error;
pub(crate) mod exec_helper;
mod fortune;
mod store;

pub(crate) use store::{get_db_pool, Db};

#[derive(Clone)]
pub struct ModelManager {
    db: Db,
    sqids: Arc<sqids::Sqids>,
}

impl ModelManager {
    pub async fn new() -> Result<ModelManager> {
        let sqids = Arc::new(
            Sqids::builder()
                .min_length(10)
                .build()
                .map_err(|err| Error::FailedToBuildSqids(err.to_string()))?,
        );
        Ok(Self {
            db: get_db_pool(&config().DB_URL).await?,
            sqids,
        })
    }

    pub(in crate::model) fn db(&self) -> &Db {
        &self.db
    }

    pub(in crate::model) fn encode_id(&self, id: i64) -> Result<String> {
        Ok(self.sqids.encode(&[id as u64])?)
    }

    pub(in crate::model) fn decode_id(&self, id: String) -> Result<i64> {
        let decoding = self.sqids.decode(&id);
        let id = decoding.first().ok_or(Error::FailedToDecodeId)?;
        Ok(*id as i64)
    }
}
