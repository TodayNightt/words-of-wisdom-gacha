use super::{Error, Result};
use sqlx::{sqlite::SqlitePoolOptions, Pool, Sqlite};

pub type Db = Pool<Sqlite>;

pub(crate) async fn get_db_pool(url: &str) -> Result<Db> {
    let db_option = url.parse()?;

    SqlitePoolOptions::new()
        .max_connections(5)
        .connect_with(db_option)
        .await
        .map_err(|err| Error::FailToCreatePool(err.to_string()))
}
