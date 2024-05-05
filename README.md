# To dump the database

```bash
cd words_of_wisdom_gacha
sudo apt install sqlite3
sqlite3 ./container-data/db/prod.db .dump > dump.sql
mv dump.sql ./container-data/migrations/dump.sql
```
