# Task 012 — Neon Development Database Setup

## Status

Complete.

## Goal

Configure the real local/dev database workflow so Prisma persistence can run against Neon Postgres.

## Scope

- Set up Neon as the development database host.
- Use Postgres 18 without Neon Auth.
- Create/use a Neon project for `adambelton.com`.
- Create a `dev` database branch from the existing `production` branch.
- Pull local database environment variables into a gitignored env file.
- Apply the existing Prisma migration to the Neon `dev` branch.
- Verify direct database connectivity without printing secrets.
- Add `.env.example` placeholders.
- Add local development documentation for Neon and Prisma commands.
- Document that `.neon` is local generated tool state and stays gitignored.
- Remove generated third-party Neon skill snapshots from the working tree.

## Out Of Scope

- Owner auth.
- Real AI integration.
- New database schema changes.
- Production deployment setup.
- Production data refresh/anonymization workflow.
- Committing database secrets.
- Committing generated third-party Neon skill files.

## Definition Of Done

- Neon `dev` branch exists for development.
- `.env.local` contains local Neon connection variables and remains ignored.
- Existing Prisma migration is applied to the Neon `dev` database.
- A direct database smoke check succeeds.
- `.env.example` documents expected environment variables without secrets.
- Local development docs explain the Neon branch model and migration workflow.
- `.neon` is gitignored and contains no branch ID.
- `pnpm db:validate`, `pnpm db:generate`, `pnpm test`, and `pnpm typecheck` pass.

## Validation

```txt
set -a; source .env.local; set +a; pnpm db:migrate:deploy
pnpm db:validate
pnpm db:generate
pnpm test
pnpm typecheck
```

## Completed Notes

- Neon project: `adambelton.com`.
- Neon Postgres version: 18.
- Neon Auth: not enabled.
- Neon branches:
  - `production`
  - `dev`
- Applied Prisma migration `0001_init` to the `dev` branch.
- Verified connectivity by querying `_prisma_migrations`.
- The Neon CLI printed a dev connection URI during branch creation; do not repeat it in docs or commits.
