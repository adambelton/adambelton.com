# Progress

## Current status

The monorepo has been scaffolded with the intended app/package structure. No real product behaviour has been implemented yet.

The repo currently has a basic Next.js web shell, a basic Hono API shell, a working health route, initial shared types, and context files for future Codex tasks.

## Implemented

- Monorepo structure with `apps/web`, `apps/api`, and the intended `packages/*` boundaries.
- Root `pnpm` workspace configuration.
- Root TypeScript configuration.
- Basic `apps/web` Next.js landing page.
- Basic `apps/api` Hono server.
- `GET /health` API route.
- Initial `packages/shared` API response, user, writing, product, and Socratic Draft type files.
- Initial product registry containing The Socratic Draft.
- Initial `packages/auth` access-level helper.
- Initial `packages/ai` LLM interface and fake LLM client.
- Initial `packages/db` database client placeholder.
- Initial `packages/products` package boundary.
- `AGENTS.md` repo instructions for future agents.
- `docs/decisions.md` decision log.
- `tasks/README.md` task index.
- `tasks/001-scaffold-repo.md` scaffold/context task record.

## Partially implemented

- Shared types exist, but the complete Socratic Draft thread/claim/conversation contract still needs to be filled out in Task 002.
- Product registry exists as a shared constant, but product pages have not been implemented.
- `packages/db`, `packages/auth`, `packages/ai`, and `packages/products` have package boundaries and initial stubs only.

## Not implemented

- Public writing system.
- Writing archive and individual writing pages.
- Product overview pages.
- The Socratic Draft product page.
- The Socratic Draft editor UI.
- The Socratic Draft conversation service.
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

- The shared Socratic Draft types are intentionally incomplete until Task 002.
- The current homepage is a scaffold only and should not be treated as the finished public website.
- The fake LLM client exists only to establish the package boundary; it is not wired to product behaviour.
- Demo writing persistence rules are documented but not enforced yet.
- Auth, database, AI, usage, and admin boundaries exist but do not yet contain real implementation.

## Next recommended task

Task 002 — define the full shared types and product registry contract up front.
