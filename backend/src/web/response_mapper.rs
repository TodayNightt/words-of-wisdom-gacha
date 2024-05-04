use axum::{
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use tracing::{error, info};
use uuid::Uuid;

use super::Error;

pub async fn main_response_layer(res: Response) -> Response {
    info!("main_response_layer");

    let uuid = Uuid::new_v4();

    let error = res.extensions().get::<Error>();

    let client_status_error = error.map(|err| err.client_status_and_error());

    let error_response = client_status_error.as_ref().map(|(status_code, client)| {
        let client_error_body = json!({
            "error": {
                "type" : client.as_ref(),
                "req_uuid" : uuid.to_string(),
            }
        });

        info!("client_error_body {client_error_body}");

        (*status_code, Json(client_error_body)).into_response()
    });

    info!("error :{:?}", error_response);
    info!("res :{:?}", res);
    info!("sending :{:?}", error_response.as_ref().unwrap_or(&res));
    // let client_error = client_status_error.unzip().1;
    error_response.unwrap_or(res)
}
