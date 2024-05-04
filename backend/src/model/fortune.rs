use std::collections::HashMap;

use crate::utils::Extractor;

use super::{Error, Result};
use tracing::info;

use super::ModelManager;

// region: types

#[derive(Debug)]
pub struct FortuneEntityWithoutEncoding {
    id: i64,
    fortune: String,
    collection: String,
}

impl From<(i64, String, String)> for FortuneEntityWithoutEncoding {
    fn from(value: (i64, String, String)) -> Self {
        FortuneEntityWithoutEncoding {
            id: value.0,
            fortune: value.1,
            collection: value.2,
        }
    }
}

impl Extractor for FortuneEntityWithoutEncoding {
    type ReturnValue = (i64, String, String);
    fn data(self) -> Self::ReturnValue {
        (self.id, self.fortune, self.collection)
    }
}

pub(in crate::model) struct FortuneIdWithoutEncoding(i64);

impl Extractor for FortuneIdWithoutEncoding {
    type ReturnValue = i64;
    fn data(self) -> Self::ReturnValue {
        self.0
    }
}

pub(in crate::model) struct FortuneBmc;

// endregion: types

impl FortuneBmc {
    pub(in crate::model) async fn create(
        mm: &ModelManager,
        data: String,
        collection_id: i64,
    ) -> Result<FortuneIdWithoutEncoding> {
        info!("FortuneBmc - create");

        let db = mm.db();

        let result = sqlx::query("INSERT INTO fortunes (fortune,collection_id) VALUES ($1,$2)")
            .bind(data)
            .bind(collection_id)
            .execute(db)
            .await?
            .last_insert_rowid();

        Ok(FortuneIdWithoutEncoding(result))
    }

    pub(in crate::model) async fn create_bulk(
        mm: &ModelManager,
        data: HashMap<i64, Vec<String>>,
    ) -> Result<Vec<FortuneIdWithoutEncoding>> {
        info!("FortuneBmc - create_bulk");

        let db = mm.db();

        let mut result_ids: Vec<FortuneIdWithoutEncoding> = vec![];

        for (collection_id, data) in data.into_iter() {
            let trx = db.begin().await?;
            for item in data.into_iter() {
                // FIXME : Avoid using single value insertion.
                //         Too many calls :(
                let result = FortuneBmc::create(mm, item, collection_id).await?;

                result_ids.push(result);
            }

            trx.commit().await?;
        }

        Ok(result_ids)
    }
    pub(in crate::model) async fn get(
        mm: &ModelManager,
        id: i64,
    ) -> Result<FortuneEntityWithoutEncoding> {
        info!("FORTUNEBMC - get");

        let db = mm.db();

        let (id, fortune,collection) = sqlx::query_as::<_, (i64, String, String)>(
            "SELECT f.id, f.fortune, c.collection FROM fortunes f INNER JOIN collections c ON f.collection_id = c.id WHERE f.id = $1",
        )
        .bind(id)
        .fetch_one(db)
        .await?;

        Ok(FortuneEntityWithoutEncoding {
            id,
            fortune,
            collection,
        })
    }
    pub(in crate::model) async fn get_random(mm: &ModelManager) -> Result<(String, String)> {
        info!("FORTUNEBMC - get_random");
        let db = mm.db();

        let result= sqlx::query_as::<_, (String, String)>(
            "SELECT f.fortune, c.collection FROM fortunes f INNER JOIN collections c ON f.collection_id = c.id ORDER BY RANDOM() LIMIT 1",
        )
        .fetch_one(db)
        .await?;

        Ok(result)
    }

    pub(in crate::model) async fn get_collection_id(mm: &ModelManager, id: i64) -> Result<i64> {
        info!("FORTUNEBMC- get_collection_id");

        let db = mm.db();

        let (id,) = sqlx::query_as::<_, (i64,)>("SELECT collection_id FROM fortunes WHERE id=$1")
            .bind(id)
            .fetch_one(db)
            .await?;

        Ok(id)
    }

    pub(in crate::model) async fn list(
        mm: &ModelManager,
    ) -> Result<Vec<FortuneEntityWithoutEncoding>> {
        info!("FORTUNEBMC - list");
        let db = mm.db();

        let result = sqlx::query_as::<_, (i64, String, String)>(
            "SELECT f.id, f.fortune, c.collection FROM fortunes f INNER JOIN collections c ON f.collection_id = c.id",
        )
        .fetch_all(db)
        .await?;

        let result: Vec<FortuneEntityWithoutEncoding> = result
            .into_iter()
            .map(FortuneEntityWithoutEncoding::from)
            .collect();

        // FIXME : This might have a bug
        Ok(result)
    }

    pub(in crate::model) async fn update(mm: &ModelManager, id: i64, data: String) -> Result<()> {
        info!("FORTUNEBMC - update id:{id}");
        let db = mm.db();

        let updated_rows = sqlx::query("UPDATE fortunes SET fortune=$1 WHERE id=$2")
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

    pub(in crate::model) async fn update_collection_id(
        mm: &ModelManager,
        id: i64,
        collection_id: i64,
    ) -> Result<()> {
        info!("FORTUNEBMC - update_collection_id id:{id}");

        let db = mm.db();

        let updated_rows = sqlx::query("UPDATE fortunes SET collection_id=$1 WHERE id=$2")
            .bind(collection_id)
            .bind(id)
            .execute(db)
            .await?
            .rows_affected();

        if updated_rows.ne(&1) {
            return Err(Error::ItemNotFound(format!("id : {id}")));
        }

        Ok(())
    }

    pub(in crate::model) async fn swap_collection_id(
        mm: &ModelManager,
        original_collection_id: i64,
        swap_to_collection_id: i64,
    ) -> Result<i64> {
        let db = mm.db();

        let trx = db.begin().await?;
        let result = sqlx::query("UPDATE fortunes SET collection_id=$1 WHERE collection_id=$2")
            .bind(swap_to_collection_id)
            .bind(original_collection_id)
            .execute(db)
            .await;

        let updated_row = match result {
            Ok(result) => result.rows_affected(),
            Err(err) => {
                trx.rollback().await?;
                return Err(err.into());
            }
        };

        trx.commit().await?;

        Ok(updated_row as i64)
    }

    pub(in crate::model) async fn delete(mm: &ModelManager, id: i64) -> Result<()> {
        info!("FORTUNEBMC - delete id:{id}");

        let db = mm.db();

        let deleted_row = sqlx::query("DELETE FROM fortunes WHERE id=$1")
            .bind(id)
            .execute(db)
            .await?
            .rows_affected();

        if deleted_row.ne(&1) {
            return Err(Error::ItemNotFound(format!("id : {id}")));
        }

        Ok(())
    }

    pub(in crate::model) async fn count_by_collection(
        mm: &ModelManager,
        collection_id: i64,
    ) -> Result<i64> {
        info!("FORTUNEBMC - count_by_collection_id");

        let db = mm.db();

        let (count,) =
            sqlx::query_as::<_, (i64,)>("SELECT COUNT(*) FROM fortunes WHERE collection_id=$1")
                .bind(collection_id)
                .fetch_one(db)
                .await?;
        Ok(count)
    }
}
