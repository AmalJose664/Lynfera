# Deployment-site

## Lynfera

Frontend Directory

## 🔧 Folder Diagram

```
frontend
├───public
└───src
    ├───app
    │   ├───(auth)
    │   │   ├───auth
    │   │   │   └───success
    │   │   ├───components
    │   │   ├───login
    │   │   ├───signup
    │   │   └───user
    │   │       └───plan
    │   ├───(deployment)
    │   │   └───deployments
    │   │       └───[id]
    │   ├───(help)
    │   │   ├───docs
    │   │   │   ├───build-deploy
    │   │   │   ├───env-variables
    │   │   │   ├───getting-started
    │   │   │   ├───observability
    │   │   │   ├───support-and-limits
    │   │   │   └───troubleshoot
    │   │   └───product
    │   ├───(marketing)
    │   │   ├───payment-success
    │   │   ├───pricing
    │   │   └───showcase
    │   ├───(project)
    │   │   ├───new
    │   │   └───projects
    │   │       └───[id]
    │   │           └───components
    │   ├───(resources)
    │   │   └───resources
    │   ├───legal
    │   │   ├───privacy
    │   │   └───terms-of-use
    │   ├───providers
    │   └───public
    ├───components
    │   ├───analytics
    │   ├───docs
    │   ├───modals
    │   ├───project
    │   └───ui
    ├───config
    ├───hooks
    ├───lib
    │   ├───moreUtils
    │   └───schema
    ├───store
    │   ├───services
    │   └───slices
    └───types

```

## 🔐 Environment Variables

Create a `.env` file in this directory: frontend

```env
NEXT_PUBLIC_API_SERVER_ENDPOINT=http://localhost:8000/api
NEXT_PUBLIC_PROXY_SERVER=localhost:7000
NEXT_PUBLIC_POSTHOG_KEY=     // for analytics
NEXT_PUBLIC_POSTHOG_HOST=   // for analytics
```

<br/>
<br/>

## ~~~~

```sh
cd Deployment-site/frontend
```

## Commands

```sh
npm run dev
```

```sh
npm run build
```

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
<br/>
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
