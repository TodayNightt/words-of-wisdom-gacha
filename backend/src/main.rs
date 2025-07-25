pub mod auth;
pub mod config;
pub mod ctx;
pub mod error;
mod migrations;
pub mod model;
pub mod utils;
pub mod web;

use axum::{middleware, routing::get, Router};
use config::config;
pub use error::{Error, Result};
use tower_http::cors::{AllowOrigin, CorsLayer};
use tracing::info;
use tracing_subscriber::FmtSubscriber;
use web::mw_context::mw_ctx_require;

use crate::{migrations::check_db_present, model::ModelManager};

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt().with_target(true).compact().with_thread_ids(false).init();

    check_db_present().await?;

    let mm = ModelManager::new().await?;

    let ctx_require_routes = web::routes_fortune::routes_with_context(mm.clone())
        .merge(web::routes_collections::routes_with_context(mm.clone()))
        .merge(web::routes_login::routes_with_context())
        .layer(middleware::from_fn(mw_ctx_require));

    let app = Router::new()
        .merge(web::routes_login::routes())
        .merge(web::routes_fortune::routes(mm.clone()))
        .merge(ctx_require_routes)
        .route("/server/health", get(|| async { "Hello World" }))
        .layer(middleware::map_response(
            web::response_mapper::main_response_layer,
        ))
        .layer(middleware::from_fn_with_state(
            mm.clone(),
            web::mw_context::mw_get_ctx,
        ))
        .layer(
            CorsLayer::new()
                .allow_origin(AllowOrigin::exact("http://backend-proxy".parse().unwrap())),
        );

    let listener = tokio::net::TcpListener::bind("0.0.0.0:51000")
        .await?;

    info!("Starting server at 0.0.0.0:51000");

    axum::serve(listener, app).await?;

    Ok(())
}
