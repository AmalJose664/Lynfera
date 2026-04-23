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

GOOGLE_CLIENT_ID= // for Google auth
GOOGLE_CLIENT_SECRET= // for Google auth

GITHUB_CLIENT_ID= // for Github auth
GITHUB_CLIENT_SECRET= // for Github auth

GITHUB_WEBHOOK_SECRET= // Github App secret // for git push deployments
GITHUB_APP_PRIVATE_KEY= // Github App private key as single line string // for git push deployments


CONTAINER_API_TOKEN=  //Simple random string // generate via `node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"` // also same in build server envs
CONTAINER_NAME=amal664/lynfera-builds

SUBNETS_STRING=
CLOUD_ACCESSKEY=
CLOUD_SECRETKEY=
CLOUD_ENDPOINT= // aws credentials
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

BUILD_DISPATCH_PAT_TOKEN= // build process starter token (eg: Github action start token)
BUILD_DISPATCH_URL= // build process starter url (eg: Github action start token)
VERIFICATION_TOKEN_SECRET= // Token same like refresh token used for otp additional verification // For OTPs

OTP_SEND_URL= // otp send service url, eg : brevo.com
OTP_SEND_API_KEY=
EMAIL_SENDER_NAME=
EMAIL_SENDER_EMAIL=

NOTIFY_EVENTS_API_KEY= // custom notification api key, Visit https://ping-forge.vercel.app/ for more details

USE_REDIS_EMITTER= // true / false // used for internal event emitter; set to true if you have than 1 instance of backend running; Requires redis instance. Set to false to use simple event emitter

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

## Dependencies

This project requires the following services:

- MongoDB
- Redis
- Kafka
- ClickHouse
- Builder docker runner (AWS Ecs/Github Actions, Circle CI etc)
- Stripe
- Github App (eg: https://github.com/apps/lynfera-app)

Make sure these services are installed and running before starting the application.
