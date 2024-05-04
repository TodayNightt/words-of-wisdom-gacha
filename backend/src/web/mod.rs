use axum::{
    http::{header, Response},
    response::IntoResponse,
};
use axum_extra::extract::cookie::{Cookie, SameSite};
pub use error::{Error, Result};
mod error;
pub mod mw_context;
pub mod response_mapper;
pub mod routes_collections;
pub mod routes_fortune;
pub mod routes_login;

pub const AUTH_TOKEN: &str = "auth-token";

// https://github.com/rust10x/rust-web-app/blob/9995c67e01003b42e08887b4a6941b5e8743d5bf/src/web/mod.rs#L20
pub(in crate::web) fn set_token_cookie<T: IntoResponse>(
    res: &mut Response<T>,
    token: String,
) -> Result<()> {
    let cookie = Cookie::build((AUTH_TOKEN, token.to_owned()))
        .path("/")
        .max_age(time::Duration::hours(1))
        .http_only(true)
        .same_site(SameSite::Lax)
        .build();

    res.headers_mut()
        .insert(header::SET_COOKIE, cookie.to_string().parse().unwrap());

    Ok(())
}

pub(in crate::web) fn remove_token_cookie<T: IntoResponse>(req: &mut Response<T>) -> Result<()> {
    let cookie = Cookie::build((AUTH_TOKEN, ""))
        .path("/")
        .max_age(time::Duration::hours(-1))
        .same_site(SameSite::Lax)
        .http_only(true)
        .build();

    req.headers_mut()
        .insert(header::SET_COOKIE, cookie.to_string().parse().unwrap());

    Ok(())
}
