use super::{remove_token_cookie, Error, Result};
use crate::{auth::TokenClaims, config::config, web::set_token_cookie};
use axum::{response::IntoResponse, routing::post, Json, Router};
use jsonwebtoken::{encode, EncodingKey, Header};
use serde::Deserialize;
use serde_json::json;
use tracing::info;

pub fn routes_with_context() -> Router {
    Router::new().route("/api/admin/logoff", post(handle_logoff))
}

pub fn routes() -> Router {
    Router::new().route("/api/admin/login", post(handle_login))
}

// region: types

#[derive(Deserialize)]
struct UserForLogin {
    username: String,
    password: String,
}

#[derive(Deserialize)]
struct UserForLogOff {
    username: String,
}

// endregion: types

async fn handle_login(Json(payload): Json<UserForLogin>) -> Result<impl IntoResponse> {
    info!("HANDLER - login");
    let username = payload.username;

    if username.ne(&config().ROOT_USER) {
        return Err(Error::LoginWrongUser(username));
    }
    let password = payload.password;

    if password.ne(&config().ROOT_PASS) {
        return Err(Error::LoginWrongPass);
    }

    //https://github.com/wpcodevo/rust-axum-jwt-auth/blob/master/src/handler.rs
    let current_time = chrono::Utc::now();

    let iat = current_time.timestamp() as usize;

    let exp = (current_time + chrono::Duration::hours(1)).timestamp() as usize;

    let claims = TokenClaims::new(exp, iat, username);

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(config().KEY.as_ref()),
    )?;

    let mut response = Json(json!({
        "result": {
            "token" : token,
            "success" : true,
        }
    }))
    .into_response();

    set_token_cookie(&mut response, token)?;

    Ok(response)
}

async fn handle_logoff() -> Result<impl IntoResponse> {
    info!("HANDLER - logoff");
    // FIXME : This seems odd without anything to validata
    //         It seems like that the validation process happens in the mw_context_require
    let mut response = Json(json!({
        "result" : {
            "success" :true
        }
    }))
    .into_response();

    remove_token_cookie(&mut response)?;

    Ok(response)
}
