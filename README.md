# AI Agent Platform

## Monorepo Setup

This project uses Turborepo for monorepo management. It contains:
- `apps/api`: NestJS backend + Prisma ORM
- `apps/web`: React + Vite + Tailwind + shadcn/ui frontend
- `packages/*`: Shared utilities and configurations

## Prerequisites

- Node.js (v18+)
- Docker and docker-compose (for local PostgreSQL database)

## Local Setup

1. **Install dependencies**:
   Run this command in the root folder:
   ```bash
   npm install
   ```

2. **Start PostgreSQL via Docker**:
   Run this in a new terminal window:
   ```bash
   docker-compose up -d
   ```

3. **Database Environment Variables**:
   Create a `.env` file inside `apps/api/` based on `apps/api/.env.example` (or set it to `postgresql://root:password@localhost:5432/ai_agent_platform?schema=public` matching the docker-compose setup).

4. **Run Prisma Migrations**:
   Run the following from the `apps/api` directory to push your `contract.prisma` to the database (if using Prisma v8 RC) or generate the client.
   ```bash
   cd apps/api
   npx prisma generate --schema=prisma/contract.prisma
   npx prisma db push --schema=prisma/contract.prisma
   ```

5. **Start the Development Servers**:
   In the root directory, start both the frontend and backend simultaneously using Turborepo:
   ```bash
   npm run dev
   ```
   - The frontend will be available (usually on http://localhost:5173).
   - The backend API will be available on http://localhost:3000.
