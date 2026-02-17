# Deployment-site

## Lynfera

reverse-proxy-server Directory

## 🔧 Folder Diagram

```
reverse-proxy-server

└───src
    ├───cache
    ├───config
    ├───constants
    ├───controller
    ├───interfaces
    │   ├───cache
    │   ├───repository
    │   └───service
    ├───middleware
    ├───models
    ├───proxy
    │   └───handlers
    ├───repository
    ├───routes
    ├───service
    ├───utils
    └───views

```

## 🔐 Environment Variables

Create a `.env` file in this directory: reverse-proxy-server

```env
MONGO_URL=

OWN_DOMAIN=localhost
KAFKA_USERNAME=
KAFKA_PASSWORD=
CLOUD_STORAGE_BUCKET_NAME=

FRONTEND_URL=
STORAGE_MODE=cloud # or local
CLOUD_STORAGE_BASE_URL=
LOCAL_STORAGE_BASE_URL=

CLOUD_STORAGE_SERVER_ACCESS_KEY=
CLOUD_STORAGE_SERVER_ACCESS_SECRET=
CLOUD_STORAGE_SERVER_ENDPOINT=


REDIS_URL=
```

<br/>
<br/>

## ~~~~

```sh
cd Deployment-site/reverse-proxy-server
```

## Commands

```sh
npm run dev
```

```sh
npm run build
```
