# AI Agent Platform

## Monorepo Setup

This project uses Turborepo for monorepo management. It contains:
- `apps/api`: NestJS backend + Prisma ORM
- `apps/web`: React + Vite + Tailwind + shadcn/ui frontend
- `packages/*`: Shared utilities and configurations

## Quickstart

For a complete step-by-step walkthrough and troubleshooting, see the [HOW_TO_START.md](HOW_TO_START.md) guide.

### Prerequisites

- Node.js (v18+)
- Docker and Docker Compose (for PostgreSQL 15)
- Google Gemini API Key (set as `GEMINI_API_KEY` in `apps/api/.env` for AI Agent tasks)

### Local Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start PostgreSQL via Docker**:
   ```bash
   docker-compose up -d
   ```

3. **Configure Environment Variables**:
   Copy or configure `apps/api/.env`:
   ```bash
   cp apps/api/.env.example apps/api/.env
   ```
   Ensure `DATABASE_URL` is:
   `postgresql://root:password@localhost:5432/ai_agent_platform`

4. **Initialize Database (Prisma 8 ORM)**:
   ```bash
   cd apps/api
   npx prisma contract emit
   npx prisma db init
   cd ../..
   ```

5. **Start the Development Servers**:
   In the root directory, start both frontend and backend simultaneously:
   ```bash
   npm run dev
   ```

### Services & URLs

- **Frontend Web UI**: [http://localhost:5180](http://localhost:5180)
- **Backend API**: [http://localhost:3000](http://localhost:3000)
- **Swagger Documentation**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

