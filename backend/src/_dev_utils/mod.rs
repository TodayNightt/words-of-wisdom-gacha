use tokio::sync::OnceCell;
use tracing::info;

mod dev_db;

pub async fn _init_dev() {
    static INIT: OnceCell<()> = OnceCell::const_new();

    INIT.get_or_init(|| async {
        info!("FOR-DEV-ONLY - init_dev_all()");

        dev_db::_init_dev_db().await.unwrap();
    })
    .await;
}
