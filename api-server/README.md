# Deployment-site

## Lynfera

Api server Directory

## 🔧 Folder Diagram

```
api-server
├───node_modules/
└───src
    ├───cache
    ├───config
    │   └───oauthStrategies
    ├───constants
    │   └───populates
    ├───controllers
    ├───dtos
    ├───events
    │   ├───handlers
    │   ├───schemas
    │   └───types
    ├───interfaces
    │   ├───cache
    │   ├───consumers
    │   ├───controller
    │   ├───repository
    │   │   └───Base
    │   └───service
    ├───mappers
    ├───middlewares
    ├───models
    ├───repositories
    │   └───base
    ├───routes
    ├───services
    └───utils
```

## 🔐 Environment Variables

Create a `.env` file in this directory: api-server

```env
MONGO_URL=mongodb+.....
PORT=port
FRONTEND_URL=http://localhost:3000

REFRESH_TOKEN_SECRET=
ACCESS_TOKEN_SECRET=
SERVICE_JWT_SECRET=   // for access token generation for container api calls

API_ENDPOINT=http://localhost:8000

NODE_ENV=development

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

CONTAINER_API_TOKEN=
CONTAINER_NAME=amal664/lynfera-builds

SUBNETS_STRING=
CLOUD_ACCESSKEY=
CLOUD_SECRETKEY=
CLOUD_ENDPOINT=
CLUSTER_ARN=
TASK_ARN=
SECURITY_GROUPS=
CLOUD_BUCKET=

KAFKA_USERNAME=
KAFKA_PASSWORD=

CLICKHOUSE_USERNAME=
CLICKHOUSE_PASSWORD=
CLICKHOUSE_HOST_URL_WITH_PORT= // use this for conns

STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

REDIS_URL=

BUILD_DISPATCH_PAT_TOKEN= // build process starter token
BUILD_DISPATCH_URL= // build process starter url
VERIFICATION_TOKEN_SECRET= // Token same like refresh token used for otp additional verification

OTP_SEND_URL= // otp send service url, eg : brevo.com
OTP_SEND_API_KEY=
EMAIL_SENDER_NAME=
EMAIL_SENDER_EMAIL=

NOTIFY_EVENTS_API_KEY= // custom notification api key, Visit https://ping-forge.vercel.app/ for more details

```

<br/>
<br/>

## ~~~~

```sh
cd Deployment-site/api-server
```

## Commands

```sh
npm run dev
```

```sh
npm run build
```

## Additional Services needed

- **[Mongo Db](https://www.mongodb.com/)**
- **[Clickhouse](https://clickhouse.com/)**
- **[Kafka](https://kafka.apache.org/)**
- **[Redis](https://redis.io/docs/latest/)**
- **[Builder container runner](https://www.google.com/search?q=aws+ecs)**
