CREATE TABLE IF NOT EXISTS fortunes (
    id         INTEGER UNIQUE
                       PRIMARY KEY AUTOINCREMENT,
    fortune    TEXT    UNIQUE NOT NULL,
    collection_id INTEGER REFERENCES collections (id) ON DELETE CASCADE
                                                   ON UPDATE CASCADE
);


CREATE TABLE IF NOT EXISTS collections(
    id          INTEGER UNIQUE
                        PRIMARY KEY AUTOINCREMENT,
    collection  TEXT UNIQUE NOT NULL
)
