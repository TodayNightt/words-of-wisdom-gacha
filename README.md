<div align="center">

# Words of Wisdom Gacha

</div>

# 🛠️ Getting Started

## 📦 Prerequisites
- Docker


## 🏗️ Build and Run
1. Clone the repository:
```bash
git clone https://github.com/TodayNightt/words-of-wisdom-gacha
```

2. Navigate to the project directory:
```bash
cd words-of-wisdom-gacha
```

3. Build and run the Docker containers:
```bash
docker compose up
```

4. Access the application:
   - Open your web browser and go to `http://localhost:80` to access the API


## Routes
### /server/health
- **Method**: `GET`
- **Require login**: `false`
- **Uses**: Check health
- **Request Payload**: `None`

### Fortune API
### /api/fortune/random
- **Method**: `GET`
- **Require login**: `false`
- **Uses**: Get a random fortune
- **Request Payload**: `None`
- **Response Payload**: `{"fortune" : string, collection_name : string}`

### /api/fortune/create
- **Method**: `POST`
- **Require login**: `true`
- **Uses**: Create new fortune
- **Request Payload**: `{"fortune" : string, "collection_name" : string}`
- **Response Payload**: `{"id" : string}`

### /api/fortune/get
- **Method**: `GET`
- **Require login**: `true`
- **Uses**: Get the fortune with the corresponding id
- **Request Payload**: `{"id" : string}`
- **Response Payload**: `{"id" :  string", "fortune" : string, "collection_name" : string}`

### /api/fortune/list
- **Method**: `GET`
- **Require login**: `true`
- **Uses**: Get all the fortunes in a list
- **Request Payload**: None
- **Response Payload**: `{list : [{"id" : string, "fortune" : string, "collection_name" : string}]}`

### /api/fortune/update
- **Method**: `POST`
- **Require login**: `true`
- **Uses**: Update fortune by id
- **Request Payload**: `{"id" : string, "collection_name" : string, "data" : string}`
- **Response Payload**: `{"id" : string}`

### /api/fortune/delete
- **Method**: `DELETE`
- **Require login**: `true`
- **Uses**: Delete fortune by id
- **Request Payload**: `{"id" : string}`
- **Response Payload**: `{"id" : string}`

### /api/fortune/bulk
- **Method**: `POST`
- **Require login**: `true`
- **Uses**: Create fortunes in bulk
- **Request Payload**: ```Multipart form data with `file` and `hasHeader` fields```
- **Response Payload**: `{"added" : [string]}`

### /api/fortune/count
- **Method**: `POST`
- **Require login**: `true`
- **Uses**: Get count of fortunes in a collection
- **Request Payload**: `{"collection_name" : string}`
- **Response Payload**: `{"collection_name" : string, "count" : number}`

### /api/fortune/update/collection
- **Method**: `POST`
- **Require login**: `true`
- **Uses**: Update collection name of a fortune
- **Request Payload**: `{"id" : string, "collection_name" : string}`
- **Response Payload**: `{"id" : string}`

### Collection API
### /api/collection/create
- **Method**: `POST`
- **Require login**: `true`
- **Uses**: Create a new collection
- **Request Payload**: `{"collection_name" : string}`
- **Response Payload**: `{"created" : boolean, "id" : string}`

### /api/collection/list
- **Method**: `GET`
- **Require login**: `true`
- **Uses**: List all collections
- **Request Payload**: `None`
- **Response Payload**: `{list : [string]}`

### /api/collection/get
- **Method**: `GET`
- **Require login**: `true`
- **Uses**: Get collection by id using query parameter
- **Request Payload**: `{"id" : string}`
- **Response Payload**: `{"id" : string, "collection_name" : string}`

### /api/collection/delete
- **Method**: `DELETE`
- **Require login**: `true`
- **Uses**: Delete collection by id
- **Request Payload**: `{"to_delete_collection_name" : string, "swap_to_collection_name" : optional<string>}`
- **Response Payload**: `{"deleted" : boolean, "deletedCollectionName" : string, "changeCollectionName" : string, affected : number}`

### Login API
### /api/login
- **Method**: `POST`
- **Require login**: `false`
- **Uses**: Login user
- **Request Payload**: `{"username" : string, "password" : string}`
- **Response Payload**: `{"token" : string, "success" : boolean}`

### /api/logoff
- **Method**: `POST`
- **Require login**: `true`
- **Uses**: Logoff user
- **Request Payload**: `None`
- **Response Payload**: `{"success" : boolean}`