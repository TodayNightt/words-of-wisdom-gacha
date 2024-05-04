use crate::{
    utils::Extractor,
    web::routes_collections::{CollectionName, CollectionNames},
};

use super::{Error, Result};
use tracing::info;

use super::ModelManager;

// region: types
pub(in crate::model) struct CollectionBmc;

pub(in crate::model) struct CollectionEntityWithoutEncoding {
    id: i64,
    collection_name: String,
}

impl From<(i64, String)> for CollectionEntityWithoutEncoding {
    fn from(value: (i64, String)) -> Self {
        CollectionEntityWithoutEncoding {
            id: value.0,
            collection_name: value.1,
        }
    }
}

impl Extractor for CollectionEntityWithoutEncoding {
    type ReturnValue = (i64, String);
    fn data(self) -> Self::ReturnValue {
        (self.id, self.collection_name)
    }
}

// endregion: types

impl CollectionBmc {
    pub(in crate::model) async fn create(
        mm: &ModelManager,
        collection_name: String,
    ) -> Result<i64> {
        info!("CollectionBmc - create");

        let db = mm.db();

        let result = sqlx::query("INSERT INTO collections (collection) VALUES ($1)")
            .bind(collection_name)
            .execute(db)
            .await?
            .last_insert_rowid();

        Ok(result)
    }
    pub(in crate::model) async fn get_id_by_collection_name(
        mm: &ModelManager,
        collection_name: String,
    ) -> Result<i64> {
        info!("CollectionBmc - get_id_by_collection_name");

        let db = mm.db();

        let (id,) = sqlx::query_as::<_, (i64,)>("SELECT id FROM collections WHERE collection=$1")
            .bind(collection_name)
            .fetch_one(db)
            .await?;

        Ok(id)
    }

    pub(in crate::model) async fn get(
        mm: &ModelManager,
        id: i64,
    ) -> Result<CollectionEntityWithoutEncoding> {
        info!("ColectionBmc - get");

        let db = mm.db();

        let (id, collection_name) =
            sqlx::query_as::<_, (i64, String)>("SELECT id,collection FROM collections WHERE id=$1")
                .bind(id)
                .fetch_one(db)
                .await?;

        Ok(CollectionEntityWithoutEncoding {
            id,
            collection_name,
        })
    }

    pub(in crate::model) async fn list(mm: &ModelManager) -> Result<CollectionNames> {
        info!("ColectionBmc - list");
        let db = mm.db();

        let result = sqlx::query_as::<_, (String,)>("SELECT collection from collections")
            .fetch_all(db)
            .await?;

        let result = result
            .into_iter()
            .map(|(val,)| CollectionName(val))
            .collect();

        // FIXME : This might have a bug
        Ok(result)
    }

    pub(in crate::model) async fn update(mm: &ModelManager, id: i64, data: String) -> Result<()> {
        info!("ColectionBmc - update id:{id}");
        let db = mm.db();

        let updated_rows = sqlx::query("UPDATE collections SET collection=$1 WHERE id=$2")
            .bind(data)
            .bind(id)
            .execute(db)
            .await?
            .rows_affected();

        if updated_rows.ne(&1) {
            return Err(Error::ItemNotFound(format!("id : {id}")));
        }

        Ok(())
    }

    pub(in crate::model) async fn delete(mm: &ModelManager, id: i64) -> Result<()> {
        info!("ColectionBmc - delete id:{id}");

        let db = mm.db();

        let deleted_row = sqlx::query("DELETE FROM collections WHERE id=$1")
            .bind(id)
            .execute(db)
            .await?
            .rows_affected();

        if deleted_row.ne(&1) {
            return Err(Error::ItemNotFound(format!("id : {id}")));
        }

        Ok(())
    }
}
