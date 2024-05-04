use axum::extract::{Multipart, Query};
use axum::routing::{delete, post};
use axum::{extract::State, routing::get, Json, Router};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tracing::{info, span, Level};
use super::{Error, Result};
use crate::model::exec_helper::{
    exec_fortune_count_by_collection, exec_fortune_create, exec_fortune_create_bulk,
    exec_fortune_delete, exec_fortune_get, exec_fortune_get_random, exec_fortune_list,
    exec_fortune_update, exec_fortune_update_collection,
};
use crate::model::ModelManager;
use crate::utils::Extractor;

// region: types

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FortuneEntity {
    id: String,
    fortune: String,
    collection_name: String,
}

impl From<(String, String, String)> for FortuneEntity {
    fn from(value: (String, String, String)) -> Self {
        FortuneEntity {
            id: value.0,
            fortune: value.1,
            collection_name: value.2,
        }
    }
}

impl FortuneEntity {
    pub fn new(id: String, fortune: String, collection_name: String) -> Self {
        FortuneEntity {
            id,
            fortune,
            collection_name,
        }
    }
}

pub type FortuneList = Vec<FortuneEntity>;

#[derive(Serialize, Debug)]

pub struct FortuneId(String);

impl FortuneId {
    pub fn new(id: String) -> Self {
        FortuneId(id)
    }
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct FortuneForCreate {
    fortune: String,
    collection_name: String,
}

impl Extractor for FortuneForCreate {
    type ReturnValue = (String, String);
    fn data(self) -> Self::ReturnValue {
        (self.fortune, self.collection_name)
    }
}

#[derive(Deserialize)]
struct FortuneForGet {
    id: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct FortuneForUpdate {
    id: String,
    collection_name: String,
    data: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct FortuneForUpdateCollection {
    id: String,
    collection_name: String,
}

#[derive(Deserialize)]
struct FortuneForDelete {
    id: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct FortuneForCount {
    collection_name: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FortuneRandom {
    pub fortune: String,
    pub collection_name: String,
}

// endregion: type

pub fn routes(mm: ModelManager) -> Router {
    Router::new()
        .route("/api/fortune/random", get(get_random_fortune))
        .with_state(mm)
}

pub fn routes_with_context(mm: ModelManager) -> Router {
    Router::new()
        .route("/api/fortune/create", post(create_fortune))
        .route("/api/fortune/get", get(get_fortune_info))
        .route("/api/fortune/list", get(list_all_fortune))
        .route("/api/fortune/update", post(update_fortune_by_id))
        .route("/api/fortune/delete", delete(delete_fortune_by_id))
        .route("/api/fortune/bulk", post(create_fortune_bulk))
        .route("/api/fortune/count", post(get_count_by_collection))
        .route(
            "/api/fortune/update/collection",
            post(update_fortune_collection),
        )
        .with_state(mm)
}

async fn create_fortune(
    State(mm): State<ModelManager>,
    Json(payload): Json<FortuneForCreate>,
) -> Result<Json<Value>> {
    let _ = span!(Level::TRACE, "create_fortune").enter();
    info!("HANDLER - create_fortune");

    let result = exec_fortune_create(&mm, payload.fortune, payload.collection_name).await?;

    Ok(Json(json!({
        "result" :{
            "id" : result
        }
    })))
}

// region: multipart required types

// endregion: multipart required types

async fn create_fortune_bulk(
    State(mm): State<ModelManager>,
    mut data: Multipart,
) -> Result<Json<Value>> {
    info!("HANDLER - create_fortune_bulk");
    let mut file_data = None;
    let mut has_header_field = false;
    while let Some(field) = data.next_field().await.unwrap() {
        let name = field.name().unwrap().to_string();

        if name.eq("file") {
            let data = field.bytes().await?;

            file_data = Some(data);
            continue;
        }

        if name.eq("hasHeader") {
            has_header_field = true;
            continue;
        }
    }

    dbg!(&file_data, &has_header_field);

    let Some(data) = file_data else {
        return Err(Error::NoRequiredFieldInMultipart("file".to_string()));
    };

    let mut reader = csv::ReaderBuilder::new()
        .has_headers(has_header_field)
        .from_reader(data.as_ref());

    let records: Vec<FortuneForCreate> =
        reader.deserialize::<FortuneForCreate>().flatten().collect();

    dbg!(&records);

    let tuple_records: Vec<(String, String)> = records.into_iter().map(|val| val.data()).collect();

    let result = exec_fortune_create_bulk(&mm, tuple_records).await?;

    dbg!(&result);

    Ok(Json(json!({
        "result" : {
            "added" : result
        }
    })))
}

async fn get_fortune_info(
    State(mm): State<ModelManager>,
    Query(payload): Query<FortuneForGet>,
) -> Result<Json<Value>> {
    let _ = span!(Level::TRACE, "get_fortune_info").enter();
    info!("HANDLER - get_fortune_info");

    let result = exec_fortune_get(&mm, payload.id).await?;

    Ok(Json(json!({
        "result" : result
    })))
}

async fn get_random_fortune(State(mm): State<ModelManager>) -> Result<Json<Value>> {
    let _ = span!(Level::TRACE, "get_random_fortune").enter();
    info!("HANDLER - get_random_fortune");

    let FortuneRandom {
        fortune,
        collection_name,
    } = exec_fortune_get_random(&mm).await?;

    Ok(Json(json!({
        "result" : {
            "fortune" : fortune,
            "collectionName" :collection_name
        }
    })))
}

async fn list_all_fortune(State(mm): State<ModelManager>) -> Result<Json<Value>> {
    let _ = span!(Level::TRACE, "list_all_fortune").enter();
    info!("HANDLER - list_all_fortune");
    let result = exec_fortune_list(&mm).await?;

    let json = Json(json!({
        "result" : {
            "list" : result
        }
    }));

    Ok(json)
}

async fn update_fortune_by_id(
    State(mm): State<ModelManager>,
    Json(payload): Json<FortuneForUpdate>,
) -> Result<Json<Value>> {
    let _ = span!(Level::TRACE, "update_fortune_by_id").enter();
    info!("HANDLER - update_fortune_by_id");

    exec_fortune_update(&mm, &payload.id, &payload.data, &payload.collection_name).await?;

    Ok(Json(json!({
        "result" : {
            "id" : payload.id
        }
    })))
}

async fn update_fortune_collection(
    State(mm): State<ModelManager>,
    Json(payload): Json<FortuneForUpdateCollection>,
) -> Result<Json<Value>> {
    let _ = span!(Level::TRACE, "update_fortune_collection").enter();
    info!("HANDLER - update_fortune_collection");

    exec_fortune_update_collection(&mm, payload.id.clone(), payload.collection_name).await?;

    Ok(Json(json!({
        "result" : {
            "id" : payload.id
        }
    })))
}

async fn delete_fortune_by_id(
    State(mm): State<ModelManager>,
    Query(payload): Query<FortuneForDelete>,
) -> Result<Json<Value>> {
    let _ = span!(Level::TRACE, "delete_fortune_by_id").enter();
    info!("HANDLER - delete_fortune_by_id");

    exec_fortune_delete(&mm, &payload.id).await?;

    Ok(Json(json!({
        "result" :{
            "id" : payload.id
        }
    })))
}

async fn get_count_by_collection(
    State(mm): State<ModelManager>,
    Json(payload): Json<FortuneForCount>,
) -> Result<Json<Value>> {
    let _ = span!(Level::TRACE, "get_count_by_collection").enter();
    info!("HANDLER - get_count_by_collection");

    let result = exec_fortune_count_by_collection(&mm, payload.collection_name.clone()).await?;

    Ok(Json(json!({
        "result" : {
            "collectionName" : payload.collection_name,
            "count" : result
        }
    })))
}
