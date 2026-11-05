# Development Guide

## Local setup

```bash
pnpm install
cp .env.example .env
docker compose up -d db
pnpm prisma migrate deploy
pnpm prisma db seed
pnpm start:dev
```

The seed (`prisma/seed.ts`) creates a manager `admin@crm.com` / `password` if it does not exist. It is idempotent.

## Database workflow

| Task                         | Command                                   |
| ---------------------------- | ----------------------------------------- |
| Create a migration (dev)     | `pnpm prisma migrate dev --name <name>`   |
| Apply migrations             | `pnpm prisma migrate deploy`              |
| Regenerate the Prisma client | `pnpm prisma generate`                    |
| Open Prisma Studio           | `pnpm prisma studio`                      |
| Seed                         | `pnpm prisma db seed`                     |

## Docker

`docker-compose.yml` defines:

- `db`: PostgreSQL 17 on port `5432` (user `crm_admin`, database `crm_db`), data persisted in `./data/pg`.
- `api`: builds the `Dockerfile`, mounts the project for hot reload and sets `DATABASE_URL`, `JWT_SECRET` and `PORT` for the container.

```bash
docker compose up --build
```

Things to be aware of:

- The API is published on port `3333` (`3333:3333`), matching `PORT` and the Dockerfile `EXPOSE`.
- `JWT_SECRET` is read from your shell or a root `.env` file used by Compose, falling back to a development-only placeholder (`change-me-in-local-env`). Set your own value.
- The compose stack does not run migrations: with the `db` container up, run `pnpm prisma migrate deploy` and `pnpm prisma db seed` from your machine (the database is published on `localhost:5432`).
- Credentials in `docker-compose.yml` are for local development only.

## Code quality

```bash
pnpm lint     # ESLint with auto-fix
pnpm format   # Prettier (test files)
```

Node version is pinned in `.nvmrc`; use `nvm use`.

## Troubleshooting

| Symptom                                   | Likely cause / fix                                       |
| ----------------------------------------- | -------------------------------------------------------- |
| App exits at boot with a Zod error        | Missing or invalid `DATABASE_URL` / `JWT_SECRET` in `.env` |
| `Cannot find module '@prisma/client'` types | Run `pnpm prisma generate`                              |
| e2e tests fail to connect                 | Start the database and check `DATABASE_URL`              |
| `401` on every request                    | Token expired (1h) or signed with a different `JWT_SECRET` |
