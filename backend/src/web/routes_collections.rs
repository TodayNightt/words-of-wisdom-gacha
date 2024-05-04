use axum::{
    extract::{Query, State},
    routing::{delete, get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tracing::{info, span, Level};

use super::{Error, Result};
use crate::model::{
    exec_helper::{
        exec_collection_swap_and_delete, exec_collections_create, exec_collections_delete,
        exec_collections_get, exec_collections_list,
    },
    ModelManager,
};

// region: types

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CollectionEntity {
    id: String,
    collection_name: String,
}

impl CollectionEntity {
    pub fn new(id: String, collection_name: String) -> Self {
        CollectionEntity {
            id,
            collection_name,
        }
    }
}
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CollectionName(pub String);

pub type CollectionNames = Vec<CollectionName>;

#[derive(Deserialize)]
struct CollectionForGet {
    id: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct CollectionSwapNeeded {
    swap: bool,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct CollectionForDelete {
    to_delete_collection_name: String,
    swap_to_collection_name: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct CollectionForCreate {
    collection_name: String,
}

// endregion: types

pub fn routes_with_context(mm: ModelManager) -> Router {
    Router::new()
        .route("/api/collections/create", post(create_collection))
        .route("/api/collections/list", get(list_all_collection))
        .route("/api/collections/get", get(get_collection))
        .route("/api/collections/delete", delete(delete_collection))
        .with_state(mm)
}

async fn create_collection(
    State(mm): State<ModelManager>,
    Json(payload): Json<CollectionForCreate>,
) -> Result<Json<Value>> {
    let _ = span!(Level::TRACE, "create_collection").enter();

    let result = exec_collections_create(&mm, payload.collection_name).await?;

    Ok(Json(json!({
        "result" : {
            "created" : true,
            "id" : result
        }
    })))
}

async fn list_all_collection(State(mm): State<ModelManager>) -> Result<Json<Value>> {
    let _ = span!(Level::TRACE, "list_all_collection").enter();

    let result = exec_collections_list(&mm).await?;

    let json = Json(json!({
        "result" : {
            "list" : result
        }
    }));

    Ok(json)
}

async fn get_collection(
    State(mm): State<ModelManager>,
    Query(payload): Query<CollectionForGet>,
) -> Result<Json<Value>> {
    let _ = span!(Level::TRACE, "get_collection").enter();

    let result = exec_collections_get(&mm, payload.id).await?;

    Ok(Json(json!({
        "result" : {
            "id" : result.id,
            "collectionName" : result.collection_name
        }
    })))
}

async fn delete_collection(
    State(mm): State<ModelManager>,
    Query(query): Query<CollectionSwapNeeded>,
    Json(payload): Json<CollectionForDelete>,
) -> Result<Json<Value>> {
    let _ = span!(Level::TRACE, "delete_collection").enter();
    info!("HANDLER - delete_collection");

    let mut swap_to_collection_name_option = None;
    let mut affected_rows_option = None;

    // Exec swap and delete
    if query.swap {
        let Some(swap_to_collection_name) = payload.swap_to_collection_name else {
            return Err(Error::NoCollectionToSwap);
        };

        let result = exec_collection_swap_and_delete(
            &mm,
            payload.to_delete_collection_name.clone(),
            swap_to_collection_name.clone(),
        )
        .await?;

        swap_to_collection_name_option = Some(swap_to_collection_name);
        affected_rows_option = Some(result);
    } else {
        // Exec normal delete
        exec_collections_delete(&mm, payload.to_delete_collection_name.clone()).await?;
    }

    let mut value = json!({
        "result" :{
            "success" : true,
            "deletedCollectionName" : payload.to_delete_collection_name
        }
    });

    if swap_to_collection_name_option.is_some() && affected_rows_option.is_some() {
        if let Some(object) = value
            .as_object_mut()
            .and_then(|val| val.get_mut("result"))
            .and_then(|result_val| result_val.as_object_mut())
        {
            // Safety for Unwrap : This can call unwrap since we check with `is_some`
            object
                .entry("changeCollectionName".to_string())
                .or_insert(json!(swap_to_collection_name_option.unwrap()));

            object
                .entry("affected")
                .or_insert(json!(affected_rows_option.unwrap()));
        }
    }
    Ok(Json(value))
}
