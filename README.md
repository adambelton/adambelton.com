# adambelton.com

Adam Belton's personal website and product demo monorepo.

The site is writing-first. Product demos live inside the same repository so they can share auth, database, AI, usage, and admin infrastructure without becoming separate one-off apps.

## Structure

```txt
apps/
  web/      Next.js frontend for the public website and product UI
  api/      Hono API server
packages/
  shared/   Shared types, constants, and response helpers
  db/       Database client, schema, migrations, and repositories
  auth/     Session, magic-link, and access-level logic
  ai/       AI provider interfaces and implementations
  products/ Product-specific domain logic
```

## Commands

Install dependencies:

```sh
pnpm install
```

Run the website:

```sh
pnpm dev:web
```

Run the API:

```sh
pnpm dev:api
```

Typecheck every workspace package:

```sh
pnpm typecheck
```

## First Product

The first product is The Socratic Draft: a private Socratic writing tool that helps the user work out what they think before helping them write it.

The product planning docs currently live in `docs/products/socratic-draft/`.
