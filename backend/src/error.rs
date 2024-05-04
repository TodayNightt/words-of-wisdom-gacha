use serde::Serialize;

use crate::model;

pub type Result<T> = core::result::Result<T, Error>;

#[derive(Debug, Clone, Serialize)]
pub enum Error {
    Model(model::Error),

    ConfigMissingEnv(String),

    SqlxError(String),
    IoError(String),
}

impl From<model::Error> for Error {
    fn from(value: model::Error) -> Self {
        Error::Model(value)
    }
}

impl From<sqlx::Error> for Error {
    fn from(value: sqlx::Error) -> Self {
        Error::SqlxError(value.to_string())
    }
}

impl From<std::io::Error> for Error {
    fn from(value: std::io::Error) -> Self {
        Error::IoError(value.to_string())
    }
}

impl core::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("Error")
    }
}
impl std::error::Error for Error {}
