use axum::{http::StatusCode, response::IntoResponse};
use serde::Serialize;

use crate::model;

use super::mw_context::CtxError;

pub type Result<T> = core::result::Result<T, Error>;

#[derive(Debug, Serialize, Clone)]
pub enum Error {
    LoginWrongUser(String),
    LoginWrongPass,
    DidntHaveThisUser(String),
    NoRequiredFieldInMultipart(String),
    NoCollectionToSwap,

    // Context
    Context(super::mw_context::CtxError),

    // Modules
    Model(model::Error),
    Multipart(String),
    JWTError(String),
}

impl Error {
    pub fn client_status_and_error(&self) -> (StatusCode, ClientError) {
        match self {
            Error::Context(error) => match error {
                CtxError::NoTokenPresent | CtxError::InvalidToken => {
                    (StatusCode::UNAUTHORIZED, ClientError::NOT_LOGGED_IN)
                }
                CtxError::IncorrectUsername => (StatusCode::FORBIDDEN, ClientError::LOGIN_FAIL),
                _ => (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    ClientError::INTERNAL_SERVER_ERROR,
                ),
            },
            Error::LoginWrongPass | Error::LoginWrongUser(_) => {
                (StatusCode::FORBIDDEN, ClientError::LOGIN_FAIL)
            }
            _ => (
                StatusCode::INTERNAL_SERVER_ERROR,
                ClientError::INTERNAL_SERVER_ERROR,
            ),
        }
    }
}

impl From<model::Error> for Error {
    fn from(value: model::Error) -> Self {
        Error::Model(value)
    }
}

impl From<super::mw_context::CtxError> for Error {
    fn from(value: super::mw_context::CtxError) -> Self {
        Error::Context(value)
    }
}

impl From<axum::extract::multipart::MultipartError> for Error {
    fn from(value: axum::extract::multipart::MultipartError) -> Self {
        Error::Multipart(value.to_string())
    }
}

impl From<jsonwebtoken::errors::Error> for Error {
    fn from(value: jsonwebtoken::errors::Error) -> Self {
        Error::JWTError(value.to_string())
    }
}

impl IntoResponse for Error {
    fn into_response(self) -> axum::response::Response {
        let mut response = StatusCode::INTERNAL_SERVER_ERROR.into_response();

        response.extensions_mut().insert(self);

        response
        // (StatusCode::INTERNAL_SERVER_ERROR, "Unhandler Client Error").into_response()
    }
}

impl core::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("Error")
    }
}

impl std::error::Error for Error {}

#[allow(non_camel_case_types)]
#[derive(Debug, strum_macros::AsRefStr)]
pub enum ClientError {
    LOGIN_FAIL,
    INTERNAL_SERVER_ERROR,
    NOT_LOGGED_IN,
}

impl core::fmt::Display for ClientError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("Error")
    }
}

impl std::error::Error for ClientError {}
