#![allow(unused)] // For beginning only.

use anyhow::Result;
use reqwest::{header, Method};
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Debug, Deserialize)]
struct ErrorRes {
    uuid: String,
}
impl std::fmt::Display for ErrorRes {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("Error")
    }
}

impl std::error::Error for ErrorRes {}

#[derive(Debug, Serialize, Deserialize)]
struct NormalRes<T> {
    result: T,
}

#[derive(Debug, Serialize, Deserialize)]
struct LoginRes {
    token: String,
}

#[tokio::main]
async fn main() -> Result<()> {
    let hc = httpc_test::new_client("http://localhost:51000")?;

    let login = hc.do_post(
        "/api/admin/login",
        json!({
            "username" : "admin",
            "password" : "admin",
        }),
    );

    let login_response = login.await?;
    login_response.print().await?;

    let token = login_response
        .json_body_as::<NormalRes<LoginRes>>()?
        .result
        .token;

    println!("jwt_token :{token}");

    hc.do_get("/api/fortune/list").await?.print().await?;

    let logoff = hc.do_post(
        "/api/admin/logoff",
        json!({
            "username" : "admin",
        }),
    );

    logoff.await?.print().await?;

    hc.do_get("/api/fortune/list").await?.print().await?;

    Ok(())
}
