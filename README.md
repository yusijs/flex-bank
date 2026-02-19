# Overtime Tracker

A simple web app to track overtime hours (hours worked outside normal hours). Start/stop a timer, see your time bank balance at a glance, withdraw hours, and export to Excel or CSV.

## Features

- ⏱ **One-click timer** — Start/Stop button to record overtime sessions
- 📊 **At-a-glance summary** — Earned / Withdrawn / Balance in one view
- 📋 **Session history** — Detailed breakdown of all recorded sessions
- 💸 **Withdrawals** — Debit hours from your bank when you take time off
- 📥 **Export** — Download session history as Excel (`.xlsx`) or CSV
- 💾 **Persistent storage** — SQLite database, accessible from any device on the same host

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + [Fastify](https://fastify.dev/) |
| Database | SQLite via [Drizzle ORM](https://orm.drizzle.team/) + better-sqlite3 |
| Frontend | React 19 + Vite |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) + Tailwind CSS |
| Data Fetching | TanStack Query v5 |
| Validation | Zod (shared between frontend and backend) |
| Testing | Vitest + React Testing Library + MSW |

## Project Structure

```
overtime-tracker/
├── apps/
│   ├── api/          ← Fastify backend (port 3001)
│   └── web/          ← React + Vite frontend (port 5173)
├── packages/
│   └── shared/       ← Zod schemas, TypeScript types, utility functions
├── turbo.json
└── pnpm-workspace.yaml
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)

### Development

```bash
# Install dependencies
pnpm install

# Run both API and web in parallel
pnpm dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3001

### Tests

```bash
# Run all tests across all packages
pnpm test

# Run tests for a specific package
pnpm --filter @overtime/api test
pnpm --filter @overtime/web test
pnpm --filter @overtime/shared test
```

### Production (Docker)

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- API: http://localhost:3001

The SQLite database is persisted in `./data/overtime.db` on the host machine.

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/sessions/active` | Get the currently running session (or `null`) |
| `POST` | `/sessions/start` | Start a new session |
| `PATCH` | `/sessions/:id/stop` | Stop a running session |
| `GET` | `/sessions` | List all completed sessions |
| `DELETE` | `/sessions/:id` | Delete a session |
| `GET` | `/summary` | Get `{ totalMinutes, withdrawnMinutes, balanceMinutes }` |
| `GET` | `/withdrawals` | List all withdrawals |
| `POST` | `/withdrawals` | Create a withdrawal |
| `DELETE` | `/withdrawals/:id` | Delete a withdrawal |
| `GET` | `/export?format=xlsx\|csv` | Download export file |

## Accessing from Multiple Devices

Run the API server on a persistent host (home server, VPS, or cloud). All devices on the same network can then access the app via the host's IP address.

For remote access, consider deploying with Docker on a platform like [Railway](https://railway.app/), [Render](https://render.com/), or [Fly.io](https://fly.io/).

