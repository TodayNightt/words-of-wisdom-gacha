use serde::Serialize;

pub type Result<T> = core::result::Result<T, Error>;

#[derive(Debug, Serialize, Clone)]
pub enum Error {
    ItemNotFound(String),
    FailToCreatePool(String),
    FailedToBuildSqids(String),

    //-- sqlx errors
    DatabaseError(String),

    // -- Sqids
    SqidsError(String),
    FailedToDecodeId,
}

impl From<sqids::Error> for Error {
    fn from(value: sqids::Error) -> Self {
        Error::SqidsError(value.to_string())
    }
}

impl From<sqlx::Error> for Error {
    fn from(value: sqlx::error::Error) -> Self {
        Error::DatabaseError(value.to_string())
    }
}

impl core::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("Model Error")
    }
}

impl std::error::Error for Error {}
