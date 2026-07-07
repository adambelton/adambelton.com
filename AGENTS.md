# Agent Instructions

## Architecture Rules

This repo is a monorepo for Adam's personal website and product demos.

Use the existing package boundaries:

- `apps/web` is the Next.js frontend.
- `apps/api` is the Hono API server.
- `packages/shared` contains shared cross-package types and constants.
- `packages/db` contains schema, database client, and repositories.
- `packages/auth` contains session, magic-link, and access-level logic.
- `packages/ai` contains AI provider interfaces and implementations.
- `packages/products` contains product-specific domain logic.

Do not create new architectural patterns without approval.

## Type Rules

If a type crosses package boundaries, define it in `packages/shared`.

Do not create duplicate versions of shared types inside apps.

Do not define API response types inside React components or route files.

## Product Rules

Product-specific behaviour belongs in `packages/products`.

The Socratic Draft conversation policy belongs in `packages/products/src/socratic-draft`.

API routes should be thin and should call controllers/services.

## Implementation Rules

Do not add placeholder UI, routes, services, or buttons that are not connected to working behaviour.

A task is complete only when:

- typecheck passes
- relevant tests pass
- the changed flow works end to end
- intentionally deferred work is listed clearly
