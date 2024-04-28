mod _dev_utils;
pub mod auth;
pub mod config;
pub mod ctx;
pub mod error;
mod migrations;
pub mod model;
pub mod utils;
pub mod web;
use std::{fs, path::PathBuf};

use axum::{middleware, Router};
use config::config;
pub use error::{Error, Result};
use model::Db;
use sqlx::{migrate::MigrateDatabase, Sqlite};
// use tower_cookies::CookieManagerLayer;
use tracing::{error_span, info};
use tracing_subscriber::FmtSubscriber;
use web::mw_context::mw_ctx_require;

use crate::model::{get_db_pool, ModelManager};


#[tokio::main]
async fn main() -> Result<()> {
    tracing::subscriber::set_global_default(FmtSubscriber::default()).unwrap();

    {

    }

    let mm = ModelManager::new().await?;

    let ctx_require_routes = web::routes_fortune::routes_with_context(mm.clone())
        .merge(web::routes_collections::routes_with_context(mm.clone()))
        .merge(web::routes_login::routes_with_context())
        .layer(middleware::from_fn(mw_ctx_require));

    let app = Router::new()
        .merge(web::routes_login::routes())
        .merge(web::routes_fortune::routes(mm.clone()))
        .merge(ctx_require_routes)
        .layer(middleware::map_response(
            web::response_mapper::main_response_layer,
        ))
        .layer(middleware::from_fn_with_state(
            mm.clone(),
            web::mw_context::mw_get_ctx,
        ));
    // .layer(CookieManagerLayer::new());

    let listener = tokio::net::TcpListener::bind("0.0.0.0:51000")
        .await
        .unwrap();

    info!("Starting server at 0.0.0.0:51000");

    axum::serve(listener, app).await.unwrap();

    Ok(())
}
