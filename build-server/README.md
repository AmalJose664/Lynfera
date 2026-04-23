# 🏗️ build-server

The build-server is a Dockerized Node.js service that powers the core build pipeline for [Lynfera](https://github.com/AmalJose664/Lynfera). When a user triggers a deployment, this server fetches their frontend repository, installs dependencies, runs the build, and uploads the static output to S3-compatible storage — all inside an isolated Docker container.

> This is a **static-only** hosting platform. No server-side runtime is provided. Even frameworks like Next.js are built and served as static files from their output/export directory.

---

## 📁 File Structure

```
build-server/
├── Dockerfile          # Container definition for the build environment
├── builder.js          # Core build runner — fetches, builds, and uploads the project
├── errorHandler.js     # Pre-build failure handler — runs when a project fails before build starts
├── logTester.js        # Dev utility — simulates Kafka log events for testing the log pipeline
├── main.sh             # Entrypoint script — bootstraps and invokes builder.js
├── package.json
└── package-lock.json
```

---

## ⚙️ How It Works

1. **Container starts** — `main.sh` is the entrypoint, it bootstraps the environment and starts `builder.js`.
2. **Project is fetched** — `builder.js` calls the Lynfera API to get the user's project config (repo URL, build command, output directory, env variables).
3. **Build runs** — The frontend repo is cloned, dependencies are installed, and the build command is executed (e.g., `npm run build`).
4. **Output is uploaded** — Static files from the specified output directory are uploaded to S3-compatible object storage.
5. **On failure** — If the project fails before the build even starts (e.g., missing config, bad repo), `errorHandler.js` handles cleanup and error reporting.

```
Lynfera App
    │
    ▼
API Server ──► Spins up build-server container
                    │
                    ▼
              main.sh (entrypoint)
                    │
                    ▼
              builder.js
              ├── Fetch project config from API
              ├── Clone user's frontend repo
              ├── Install dependencies
              ├── Run build command
              └── Upload output/ → S3
```

---

## 🧩 Supported Frameworks

Any frontend framework that produces a static output directory is supported:

| Framework                   | Typical Build Command | Output Directory |
| --------------------------- | --------------------- | ---------------- |
| React (CRA)                 | `npm run build`       | `build/`         |
| Vite (React/Vue/Svelte)     | `npm run build`       | `dist/`          |
| Vue CLI                     | `npm run build`       | `dist/`          |
| Svelte / SvelteKit (static) | `npm run build`       | `build/`         |
| Next.js (static export)     | `next build`          | `out/`           |
| Nuxt (static)               | `npm run generate`    | `dist/`          |

> **Note:** Server-side features (SSR, API routes, middleware) are **not** supported. Only the static output is hosted.

---

## 🐳 Docker

The build-server is designed to run as a Docker container. Each build is a fresh container instance.

**Build the image:**

```bash
docker build -t lynfera-build-server .
```

**Run manually (for testing):**

```bash
docker run --rm \
  -e PROJECT_ID=<project-id> \
  -e API_URL=<lynfera-api-url> \
  -e S3_BUCKET=<bucket-name> \
  lynfera-build-server
```

> In production, the API server spawns and manages these containers automatically.

---

## 🛠️ Development

### Prerequisites

-   Node.js 18+
-   Docker

### Install dependencies

```bash
npm install
```

### Test the log pipeline

`logTester.js` is a developer utility to simulate the Kafka log events that `builder.js` emits during a build. Use it to test that the API server's log ingestion is working correctly — without needing to run a real build.

```bash
node logTester.js
```

---

## 🔗 Related Services

| Service                                           | Role                                                                        |
| ------------------------------------------------- | --------------------------------------------------------------------------- |
| [`api-server`](../api-server)                     | Provides project config to the build-server; receives build logs and status |
| [`frontend`](../frontend)                         | User-facing dashboard where deployments are triggered                       |
| [`reverse-proxy-server`](../reverse-proxy-server) | Routes traffic to hosted static sites post-deployment                       |
| [`test-server`](../test-server)                   | Mocks S3 locally for testing the upload step                                |
