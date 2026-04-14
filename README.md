# acquisitions

Dockerized setup for local development with Neon Local and production with Neon Cloud.

## Files added for Docker + Neon

- `Dockerfile`
- `docker-compose.yml` (default dev stack)
- `docker-compose.dev.yml` (explicit dev stack)
- `docker-compose.prod.yml` (production app stack, Neon DB is external)
- `.env.development`
- `.env.production`

## How environment switching works

- Development uses Neon Local:
  - `DATABASE_URL=postgres://neon:npg@neon-local:5432/neondb?sslmode=require`
  - `NEON_LOCAL=true`
  - `NEON_LOCAL_SQL_ENDPOINT=http://neon-local:5432/sql`
- Production uses Neon Cloud:
  - `DATABASE_URL=postgres://<user>:<password>@<endpoint>.neon.tech/<dbname>?sslmode=require&channel_binding=require`
  - `NEON_LOCAL=false`
    The app reads `DATABASE_URL` from environment variables, so the same codebase runs in both environments.

## Development: run locally with Neon Local

1. Open `.env.development` and set:
   - `NEON_API_KEY`
   - `NEON_PROJECT_ID`
   - Optionally `PARENT_BRANCH_ID` (if omitted, Neon default branch is used as parent)
2. Start dev stack:
   - `docker compose -f docker-compose.dev.yml up --build`
   - or `docker compose up --build` (uses `docker-compose.yml`)
3. App is available at `http://localhost:3000`
4. Neon Local is available on `localhost:5432`
   Neon Local ephemeral branch behavior:

- With `PARENT_BRANCH_ID` (or default branch), Neon Local creates an ephemeral branch on container start.
- With `DELETE_BRANCH=true` (default), the branch is deleted when the container stops.
  Stop dev stack:
- `docker compose -f docker-compose.dev.yml down`

## Production: run with Neon Cloud (no Neon Local proxy)

1. Open `.env.production` and set:
   - `DATABASE_URL` to your Neon Cloud URL
   - `JWT_SECRET`
   - `ARCJET_KEY`
2. Start production stack:
   - `docker compose -f docker-compose.prod.yml up --build -d`
3. Only the app container runs in production compose; Neon serverless Postgres stays managed in Neon Cloud.
   Stop production stack:

- `docker compose -f docker-compose.prod.yml down`
