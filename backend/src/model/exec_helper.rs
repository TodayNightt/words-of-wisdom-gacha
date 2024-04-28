use std::collections::HashMap;

use tracing::info;

use crate::{
    utils::Extractor,
    web::{
        routes_collections::{CollectionEntity, CollectionNames},
        routes_fortune::{FortuneEntity, FortuneId, FortuneList, FortuneRandom},
    },
};

use super::{CollectionBmc, FortuneBmc, ModelManager, Result};

pub(crate) async fn exec_fortune_create(
    mm: &ModelManager,
    data: impl Into<String>,
    collection_name: impl Into<String>,
) -> Result<FortuneId> {
    info!("EXECUTOR - exec_fortune_create");

    let collection_id = exec_collections_exists_or_create(mm, collection_name.into()).await?;

    let result = FortuneBmc::create(mm, data.into(), collection_id).await?;

    let encoded_id = mm.encode_id(result.data())?;

    Ok(FortuneId::new(encoded_id))
}

pub(crate) async fn exec_fortune_create_bulk(
    mm: &ModelManager,
    data: Vec<(String, String)>,
) -> Result<Vec<FortuneId>> {
    info!("EXECUTOR - exec_fortune_create_bulk");
    let mut map: HashMap<String, Vec<String>> = HashMap::new();

    for (fortune, collection_name) in data.into_iter() {
        map.entry(collection_name).or_default().push(fortune);
    }

    let mut id_map: HashMap<i64, Vec<String>> = HashMap::new();

    for (collection_name, fortunes) in map.into_iter() {
        let collection_id = exec_collections_exists_or_create(mm, collection_name).await?;

        id_map.entry(collection_id).or_insert(fortunes);
    }

    let result = FortuneBmc::create_bulk(mm, id_map).await?;

    let coverted_id: Result<Vec<FortuneId>> = result
        .into_iter()
        .map(|val| {
            let encoded_id = mm.encode_id(val.data())?;
            Ok(FortuneId::new(encoded_id))
        })
        .collect();

    coverted_id
}

pub(crate) async fn exec_fortune_get(
    mm: &ModelManager,
    id: impl Into<String>,
) -> Result<FortuneEntity> {
    info!("EXECUTOR - exec_fortune_get");
    let id = mm.decode_id(id.into())?;

    let result = FortuneBmc::get(mm, id).await?;

    let (id, fortune, collection_name) = result.data();

    let encoded_id = mm.encode_id(id)?;

    Ok(FortuneEntity::new(encoded_id, fortune, collection_name))
}

pub(crate) async fn exec_fortune_get_random(mm: &ModelManager) -> Result<FortuneRandom> {
    info!("EXECUTOR - exec_fortune_get_random");
    let result = FortuneBmc::get_random(mm).await?;

    Ok(FortuneRandom(result))
}

pub(crate) async fn exec_fortune_list(mm: &ModelManager) -> Result<FortuneList> {
    info!("EXECUTOR - exec_fortune_list");

    let result = FortuneBmc::list(mm).await?;

    let converted_result: Result<Vec<FortuneEntity>> = result
        .into_iter()
        .map(|val| {
            let (id, fortune, collection_name) = val.data();

            let encoded_id = mm.encode_id(id)?;

            Ok(FortuneEntity::new(encoded_id, fortune, collection_name))
        })
        .collect();

    converted_result
}

pub(crate) async fn exec_fortune_update(
    mm: &ModelManager,
    id: impl Into<String>,
    data: impl Into<String>,
    collection_name: impl Into<String>,
) -> Result<()> {
    info!("EXECUTOR - exec_fortune_update");
    let id = mm.decode_id(id.into())?;
    {
        let current_collection = FortuneBmc::get_collection_id(mm, id).await?;
        let new_collection =
            CollectionBmc::get_id_by_collection_name(mm, collection_name.into()).await?;

        if current_collection.ne(&new_collection) {
            FortuneBmc::update_collection_id(mm, id, new_collection).await?;
        }
    }
    FortuneBmc::update(mm, id, data.into()).await?;

    Ok(())
}

pub(crate) async fn exec_fortune_update_collection(
    mm: &ModelManager,
    id: impl Into<String>,
    collection_name: impl Into<String>,
) -> Result<()> {
    info!("EXECUTOR - exec_fortune_update_collection");
    let id = mm.decode_id(id.into())?;

    let collection_id =
        CollectionBmc::get_id_by_collection_name(mm, collection_name.into()).await?;

    FortuneBmc::update_collection_id(mm, id, collection_id).await?;

    Ok(())
}

pub(crate) async fn exec_fortune_delete(mm: &ModelManager, id: impl Into<String>) -> Result<()> {
    info!("EXECUTOR - exec_fortune_delete");
    let id = mm.decode_id(id.into())?;

    FortuneBmc::delete(mm, id).await?;

    Ok(())
}

pub(crate) async fn exec_fortune_count_by_collection(
    mm: &ModelManager,
    collection_name: impl Into<String>,
) -> Result<i64> {
    info!("EXECUTOR - exec_fortune_count_by_collection");

    let id = CollectionBmc::get_id_by_collection_name(mm, collection_name.into()).await?;

    let result = FortuneBmc::count_by_collection(mm, id).await?;

    Ok(result)
}

pub(crate) async fn exec_collections_get(
    mm: &ModelManager,
    id: impl Into<String>,
) -> Result<CollectionEntity> {
    info!("EXECUTOR - exec_collections_get");

    let id = mm.decode_id(id.into())?;

    let result = CollectionBmc::get(mm, id).await?;

    let (id, collection_name) = result.data();

    let encoded_id = mm.encode_id(id)?;

    Ok(CollectionEntity::new(encoded_id, collection_name))
}

pub(crate) async fn exec_collections_list(mm: &ModelManager) -> Result<CollectionNames> {
    info!("EXECUTOR - exec_collections_list");

    let result = CollectionBmc::list(mm).await?;

    Ok(result)
}

pub(crate) async fn exec_collections_update(
    mm: &ModelManager,
    id: impl Into<String>,
    data: impl Into<String>,
) -> Result<()> {
    info!("EXECUTOR - exec_collections_update");
    let id = mm.decode_id(id.into())?;

    CollectionBmc::update(mm, id, data.into()).await?;
    Ok(())
}

pub(crate) async fn exec_collections_delete(
    mm: &ModelManager,
    collection_name: impl Into<String>,
) -> Result<()> {
    info!("EXECUTOR - exec_collections_delete");

    let id = CollectionBmc::get_id_by_collection_name(mm, collection_name.into()).await?;

    CollectionBmc::delete(mm, id).await?;

    Ok(())
}

pub(crate) async fn exec_collections_exists_or_create(
    mm: &ModelManager,
    collection_name: impl Into<String> + Clone,
) -> Result<i64> {
    info!("EXECUTOR - exec_collection_exists_or_create");

    let existed_id =
        CollectionBmc::get_id_by_collection_name(mm, collection_name.clone().into()).await;

    let id = match existed_id {
        Err(_) => CollectionBmc::create(mm, collection_name.into()).await?,
        Ok(id) => id,
    };

    Ok(id)
}

pub(crate) async fn exec_collections_create(
    mm: &ModelManager,
    collection_name: impl Into<String>,
) -> Result<String> {
    info!("EXECUTOR - exec_collection_create");

    let id = CollectionBmc::create(mm, collection_name.into()).await?;

    mm.encode_id(id)
}

pub(crate) async fn exec_collection_swap_and_delete(
    mm: &ModelManager,
    collection_name_to_delete: impl Into<String>,
    swap_to: impl Into<String>,
) -> Result<i64> {
    info!("EXECUTOR - exec_collection_swap_and_delete");

    // Get the original id
    let to_delete_id =
        exec_collections_exists_or_create(mm, collection_name_to_delete.into()).await?;

    // Get the id for the swap_to
    let swap_to_id = exec_collections_exists_or_create(mm, swap_to.into()).await?;

    // Update the fortune data where to_delete_id with swap_to_id
    let row_affected = FortuneBmc::swap_collection_id(mm, to_delete_id, swap_to_id).await?;

    CollectionBmc::delete(mm, to_delete_id).await?;

    Ok(row_affected)
}
