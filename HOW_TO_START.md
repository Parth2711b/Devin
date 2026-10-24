# 🚀 Quickstart Guide: AI Agent Platform (Devin Clone)

This guide walks you through starting the entire monorepo from scratch on your machine.

---

## ⚡ TL;DR (Quick Start)

If Docker is already running and dependencies are installed:

```bash
# 1. Start Database
docker-compose up -d

# 2. Push Prisma Schema (first time only)
cd apps/api && npx prisma contract emit && npx prisma db init && cd ../..

# 3. Start Frontend & Backend
npm run dev
```

- **Frontend**: [http://localhost:5180](http://localhost:5180)
- **Backend API**: [http://localhost:3000](http://localhost:3000)
- **Swagger API Docs**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

## 📋 Prerequisites

Ensure you have the following installed before starting:
1. **Node.js**: `v18.0.0` or higher (`node -v`)
2. **npm**: `v9+` or `v10+` (`npm -v`)
3. **Docker & Docker Compose**: Ensure Docker Desktop / daemon is active (`docker ps`)
4. **Google Gemini API Key**: Required for the Devin AI Agent execution loop ([Get a free key here](https://aistudio.google.com/)).

---

## 🛠️ Step-by-Step Setup

### Step 1: Install Dependencies
Run this in the root of the project to install all workspace dependencies:
```bash
npm install
```

---

### Step 2: Start the PostgreSQL Database
Spin up the PostgreSQL 15 container in detached mode:
```bash
docker-compose up -d
```

> **Check status**: Run `docker ps` to verify that `postgres:15-alpine` is running on port `5432`.

---

### Step 3: Configure Environment Variables
Navigate to `apps/api/` and create or verify `.env`:

```bash
# If .env does not exist yet:
cp apps/api/.env.example apps/api/.env
```

Ensure `apps/api/.env` contains the following variables:

```env
# Database connection string matching docker-compose.yml
DATABASE_URL="postgresql://root:password@localhost:5432/ai_agent_platform"

# Port (optional, defaults to 3000)
PORT=3000

# Secret for signing JWT authentication tokens
JWT_SECRET="dev-secret-change-me"

# Gemini API Key (Required for Devin Agent ReAct loop)
GEMINI_API_KEY="your-gemini-api-key"

# Optional: GitHub OAuth (Leave empty to use Dev Login)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GITHUB_CALLBACK_URL="http://localhost:3000/auth/github/callback"
```

---

### Step 4: Initialize the Database (Prisma 8 ORM)
This project uses **Prisma 8 ORM** with contract-based schemas. Sync the database:

```bash
cd apps/api

# 1. Compile contract schema into contract.json and contract.d.ts
npx prisma contract emit

# 2. Bootstrap tables in the live Postgres database
npx prisma db init

# Return to root directory
cd ../..
```

*(If tables were already initialized and you only modified schemas, run `npx prisma db update` or `npx prisma db migrate`).*

---

### Step 5: Start the Development Servers
In the project root, launch Turborepo:

```bash
npm run dev
```

Turborepo will concurrently start:
- **`apps/api`** (NestJS backend on port `3000` with watch mode)
- **`apps/web`** (Vite + React frontend on port `5180`)

---

## 🌐 Endpoints & Services Reference

| Service | URL | Description |
|---|---|---|
| **Web UI** | [http://localhost:5180](http://localhost:5180) | React frontend interface |
| **API Server** | [http://localhost:3000](http://localhost:3000) | NestJS REST API |
| **Swagger Documentation** | [http://localhost:3000/api/docs](http://localhost:3000/api/docs) | Interactive Swagger UI for testing endpoints |
| **PostgreSQL Database** | `localhost:5432` | User: `root`, Password: `password`, DB: `ai_agent_platform` |

---

## 🔑 Authentication: How to Test Quickly

### Option A: Instant Dev Login (Recommended for testing)
You do not need GitHub credentials to log in. You can call the built-in dev-login endpoint:

```bash
curl -X POST http://localhost:3000/auth/dev-login \
  -H "Content-Type: application/json" \
  -d '{"email": "parth@example.com"}'
```

**Response**:
```json
{
  "access_token": "eyJhbGciOi...",
  "user": {
    "id": "...",
    "email": "parth@example.com"
  }
}
```
Copy `access_token` and use it in the Swagger UI (`Authorize` button) or as an `Authorization: Bearer <token>` header.

### Option B: GitHub OAuth
1. Create an OAuth App on [GitHub Developer Settings](https://github.com/settings/developers).
2. Set Authorization callback URL to: `http://localhost:3000/auth/github/callback`.
3. Fill `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in `apps/api/.env`.
4. Visit `http://localhost:3000/auth/github` to sign in.

---

## 🤖 Running an Agent Task (Devin)

1. **Create an Organization & Project** (via Swagger UI or API).
2. **Create a Session**: `POST /sessions` with `{ "projectId": "<ID>", "title": "Build feature X" }`.
3. **Execute Agent Task**:
   ```bash
   curl -X POST http://localhost:3000/sessions/<SESSION_ID>/agent/run \
     -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"prompt": "Create an express hello world app with index.js"}'
   ```
4. The agent initializes a local workspace in `apps/api/workspaces/<sessionId>` and performs autonomous ReAct steps using Gemini.

---

## 🛑 Common Troubleshooting

### 1. `docker: Cannot connect to the Docker daemon`
- **Solution**: Open Docker Desktop and ensure the Docker engine is running before executing `docker-compose up -d`.

### 2. `Bind for 0.0.0.0:5432 failed: port is already allocated`
- **Cause**: A local instance of PostgreSQL is already occupying port `5432`.
- **Solution**: Either stop your local postgres (`brew services stop postgresql` on macOS) or change the host port mapping in [docker-compose.yml](file:///Users/parthbansal/Dell_transfer/COEP/Devin/docker-compose.yml) (e.g., `"5433:5432"` and update `DATABASE_URL` accordingly).

### 3. `Prisma connection error`
- **Solution**: Check that the database container is healthy:
  ```bash
  docker ps
  ```
  Test credentials with:
  ```bash
  docker exec -it devin-postgres-1 psql -U root -d ai_agent_platform
  ```

### 4. `GEMINI_API_KEY is missing or invalid`
- **Cause**: Autonomous ReAct agent tasks fail with `API key not found`.
- **Solution**: Add your key to `apps/api/.env`:
  ```env
  GEMINI_API_KEY="AIzaSy..."
  ```
