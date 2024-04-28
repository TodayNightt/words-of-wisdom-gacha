use std::{fs, path::PathBuf, str::FromStr};
#[allow(unused)]
use tracing::info;

use crate::model::{get_db_pool, Db, ModelManager};

const MYSQL_DEV_DB_URL: &str = "sqlite://test.db";

const DEV_DB_URL: &str = "sqlite://test.db";

const SQL_RECREATE_DB: &str = "sql/dev_initial/00-recreate-db.sql";

const SQL_DIR: &str = "sql/dev_initial";

pub(crate) async fn _init_dev_db() -> Result<(), Box<dyn std::error::Error>> {
    info!("init_dev_db()");

    {
        let root_db = get_db_pool(MYSQL_DEV_DB_URL).await?;
        _pexec(&root_db, SQL_RECREATE_DB).await?;
    }

    let app_db = get_db_pool(DEV_DB_URL).await?;

    let paths: Vec<PathBuf> = fs::read_dir(SQL_DIR)?
        .filter_map(|entry| entry.ok().map(|e| e.path()))
        .collect();

    for path in paths.into_iter() {
        if let Some(path) = path.to_str() {
            if !path.ends_with(".sql") || path.ends_with("00-recreate-db.sql") {
                continue;
            }
            _pexec(&app_db, path).await?;
        }
    }

    Ok(())
}

async fn _pexec(db: &Db, file: &str) -> Result<(), sqlx::Error> {
    info!("{file}");

    // -- Read the file.
    let content = fs::read_to_string(file)?;

    // FIXME: Make the split more sql proof.
    let sqls: Vec<&str> = content.split(';').collect();

    for sql in sqls {
        if sql.is_empty() || sql.trim().is_empty() {
            continue;
        }
        info!("{sql}");
        sqlx::query(sql.trim()).execute(db).await?;
    }

    Ok(())
}
