use std::sync::Arc;

use axum::async_trait;
use axum::extract::FromRequestParts;
use axum::extract::Request;
use axum::extract::State;
use axum::http::header;
use axum::http::request::Parts;
use axum::http::HeaderValue;
use axum::middleware::Next;
use axum::response::Response;
use axum_extra::extract::cookie::CookieJar;
use axum_extra::extract::cookie::SameSite;
use jsonwebtoken::DecodingKey;
use jsonwebtoken::Validation;
use rand::Rng;
use serde::Serialize;
use tracing::debug;
use tracing::info;

use crate::auth;
use crate::config::config;
use crate::ctx::Ctx;
use crate::model::ModelManager;

use super::{Error, Result};

use super::AUTH_TOKEN;

pub async fn mw_ctx_require(ctx: Result<CtxW>, req: Request, next: Next) -> Result<Response> {
    info!("MIDDLEWARE - mw_ctx_require - {ctx:?}");

    ctx?;

    Ok(next.run(req).await)
}

pub async fn mw_get_ctx(
    jar: CookieJar,
    State(mm): State<ModelManager>,
    mut req: Request,
    next: Next,
) -> Response {
    let header_auth = req.headers().get(header::AUTHORIZATION);
    let ctx_result = _get_ctx(mm, &jar, header_auth).await;

    info!("req : {:?}", req);
    req.extensions_mut().insert(ctx_result);
    next.run(req).await
}

async fn _get_ctx(
    _mm: ModelManager,
    jar: &CookieJar,
    auth_header: Option<&HeaderValue>,
) -> CtxResult {
    // If there if is a cookie
    // -- Get Token String

    // https://github.com/wpcodevo/rust-axum-jwt-auth/blob/040ae80ca0c605242436630073271589b75c38bc/src/jwt_auth.rs#L31
    let token = jar
        .get(AUTH_TOKEN)
        .map(|c| c.value().to_string())
        .or_else(|| {
            auth_header
                .and_then(|auth_header| auth_header.to_str().ok())
                .and_then(|auth_value| auth_value.strip_prefix("Bearer "))
                .map(|val| val.to_string())
        });

    let Some(token) = token else {
        return Err(CtxError::NoTokenPresent);
    };

    let claims: auth::TokenClaims = jsonwebtoken::decode(
        &token,
        &DecodingKey::from_secret(config().KEY.as_bytes()),
        &Validation::default(),
    )
    .map_err(|_| CtxError::InvalidToken)?
    .claims;

    if claims
        .expiration()
        .lt(&(chrono::Utc::now().timestamp() as usize))
    {
        return Err(CtxError::InvalidToken);
    }

    let user = claims.subject();

    if config().ROOT_USER.ne(&user) {
        return Err(CtxError::IncorrectUsername);
    }

    let context_id = rand::thread_rng().gen_range(1000..=3000);

    Ctx::visitor(context_id)
        .map(CtxW)
        .map_err(|err| CtxError::CtxCreateVisitorFail(err.to_string()))
}

#[derive(Debug, Clone)]
pub struct CtxW(pub Ctx);

#[async_trait]
impl<S: Send + Sync> FromRequestParts<S> for CtxW {
    type Rejection = Error;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self> {
        info!("Ctx - EXTRACTOR");

        parts
            .extensions
            .get::<CtxResult>()
            .ok_or(Error::Context(CtxError::CtxNotInRequestExt))?
            .clone()
            .map_err(Error::Context)
    }
}

// region: CtxResult and CtxError

type CtxResult = core::result::Result<CtxW, CtxError>;

#[derive(Debug, Clone, Serialize)]
pub enum CtxError {
    IncorrectUsername,
    NoTokenPresent,
    InvalidToken,

    CtxCreateVisitorFail(String),

    CtxNotInRequestExt,
}

impl std::error::Error for CtxError {}

impl core::fmt::Display for CtxError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("CtxError")
    }
}

// endregion: CtxError
