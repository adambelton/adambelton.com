# Progress

## Current status

The monorepo has been scaffolded with the intended app/package structure. The first minimal Socratic Draft product-domain service exists, but no API, UI, persistence, or LLM-backed product flow has been implemented yet.

The repo currently has a basic Next.js web shell, a minimal Tailwind styling foundation, static public routes, a basic Hono API shell, a working health route, shared platform contracts, an initial product registry, an extractable Socratic Draft product package shape, and context files for future Codex tasks.

## Implemented

- Monorepo structure with `apps/web`, `apps/api`, and the intended `packages/*` boundaries.
- Root `pnpm` workspace configuration.
- Root TypeScript configuration.
- Repo-root absolute TypeScript import rule with workspace path resolution.
- Basic `apps/web` Next.js landing page.
- Minimal `apps/web` Tailwind styling foundation and small owned site components.
- Static public routes for `/`, `/about`, `/products`, and `/products/socratic-draft`.
- Basic `apps/api` Hono server.
- `GET /health` API route.
- `packages/shared` API response, user/access, writing, usage, and product registry types.
- Product registry containing The Socratic Draft, with lookup helpers by id and slug.
- Socratic Draft-owned shared conversation/domain contract types under `packages/products`.
- Minimal Socratic Draft server conversation service with contract-focused tests.
- Root `pnpm test` command using Vitest.
- Initial `packages/auth` access-level helper.
- Initial `packages/ai` LLM interface and fake LLM client.
- Initial `packages/db` database client placeholder.
- Initial `packages/products` package boundary.
- Standard product package shape using `shared`, `server`, and `client` boundaries.
- `AGENTS.md` repo instructions for future agents.
- Repo-native code quality and testing guidelines.
- `docs/decisions.md` decision log.
- Socratic Draft product planning docs live in `docs/products/socratic-draft/`.
- `tasks/README.md` task index.
- `tasks/001-scaffold-repo.md` scaffold/context task record.

## Partially implemented

- Product registry exists as a shared constant and is used by the static products page.
- `packages/db`, `packages/auth`, and `packages/ai` have package boundaries and initial stubs only.
- The Socratic Draft conversation service returns a deterministic stub response only; it is not yet backed by persistence, readiness logic, or an LLM.

## Not implemented

- Public writing system.
- Individual writing pages.
- The Socratic Draft editor UI.
- Conversation endpoint.
- Passwordless auth.
- Owner/demo access flow.
- Database schema, migrations, and repositories.
- Real AI provider integration.
- Demo ephemeral writing mode.
- Usage limits and cost protection.
- Publishing flow from private entries to public writing.
- Admin UI.

## Known gaps / risks

- The current homepage is an empty writing collection and should not be treated as the finished public writing system.
- The fake LLM client exists only to establish the package boundary; it is not wired to product behaviour.
- The Socratic Draft conversation service is deliberately minimal and currently establishes contract shape rather than final assistant behaviour.
- Demo writing persistence rules are documented but not enforced yet.
- Auth, database, AI, usage, and admin boundaries exist but do not yet contain real implementation.

## Next recommended task

Task 007 — Conversation endpoint with in-memory persistence.
