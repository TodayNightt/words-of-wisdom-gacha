use std::{fs, path::PathBuf};

use sqlx::migrate::MigrateDatabase;
use sqlx::Sqlite;
use tracing::{error_span, info};

use crate::model::Db;
use crate::Result;
use crate::{config, model::get_db_pool};

async fn pexec(db: &Db, file: &str) -> Result<()> {
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

pub(crate) async fn check_db_present() -> Result<()> {
    let path = PathBuf::from(&config().DB_URL);
    if path.parent().is_some_and(|a| !a.exists()){
        if let Err(err) = fs::create_dir_all(path){
            error!("{err:?}");
            return Err(err.into());
        }
    }

    if !Sqlite::database_exists(&config().DB_URL)
        .await
        .unwrap_or(false)
    {
        info!("Creating db file");
        if Sqlite::create_database(&config().DB_URL).await.is_err() {
            error_span!("db creation fail");
        } else {
            info!("Created db");
        }
    }

    info!("Generating schema");

    let db = get_db_pool(&config().DB_URL).await?;

    // If files other than the initials exists, then run that instead
    // else run the initial db setup
    let migration_exist: Vec<PathBuf> = fs::read_dir(&config().MIGRATION_DIR)?
        .filter_map(|entry| entry.ok().map(|e| e.path()))
        .filter_map(|path| {
            if let Some(extension) = path.extension() {
                if extension.eq("sql") {
                    return Some(path);
                }
            }
            None
        })
        .collect();

    // If the filtered out migration paths are not empty, we shall run that instead
    let paths: Vec<PathBuf> = if !migration_exist.is_empty() {
        migration_exist
    } else {
        fs::read_dir(format!("{}/initial", &config().MIGRATION_DIR))?
            .filter_map(|entry| entry.ok().map(|e| e.path()))
            .collect()
    };

    for path in paths.into_iter() {
        if let Some(path) = path.to_str() {
            if !path.ends_with(".sql") {
                continue;
            }
            pexec(&db, path).await?;
        }
    }

    info!("Schema Generation done");
    Ok(())
}
