# To build the docker compose image

```bash
docker compose build --build-arg USER_ID="$(id -u)" --build-arg GROUP_ID="$(id -g)"
```

# Nginx config link

```bash
ln -s config/wow-proxy.conf  /usr/local/nginx/conf/vhost/wow-proxy.conf

```

# To dump the database

```bash
cd words_of_wisdom_gacha
sudo apt install sqlite3
sqlite3 ./container-data/db/prod.db .dump > dump.sql
mv dump.sql ./container-data/migrations/dump.sql
```
