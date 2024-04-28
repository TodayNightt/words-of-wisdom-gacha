use std::{env, sync::OnceLock};

pub use crate::error::{Error, Result};

pub fn config() -> &'static Config {
    static INSTANCE: OnceLock<Config> = OnceLock::new();

    INSTANCE.get_or_init(|| {
        Config::load_from_env()
            .unwrap_or_else(|ex| panic!("FATAL - WHILE LOADING CONF - Cause: {ex:?}"))
    })
}

#[allow(non_snake_case)]
pub struct Config {
    pub(crate) DB_URL: String,
    pub(crate) ROOT_USER: String,
    pub(crate) ROOT_PASS: String,
    pub(crate) KEY: String,
    pub(crate) MIGRATION_DIR: String,
}

impl Config {
    fn load_from_env() -> Result<Config> {
        Ok(Config {
            DB_URL: get_env("DB_URL")?,
            ROOT_USER: get_env("ROOT_USER")?,
            ROOT_PASS: get_env("ROOT_PASS")?,
            KEY: get_env("KEY")?,
            MIGRATION_DIR: get_env("MIGRATION_DIR")?,
        })
    }
}

fn get_env(name: &'static str) -> Result<String> {
    env::var(name).map_err(|_| Error::ConfigMissingEnv(name.to_string()))
}
