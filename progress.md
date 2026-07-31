# Progress

## Current status

The monorepo has been scaffolded with the intended app/package structure. The first minimal Socratic Draft product-domain service, API conversation endpoint, product-owned editor UI loop, Prisma-backed persistence foundation, Neon dev database setup, host-mounted product app boundary, and owner auth foundation exist, but LLM-backed product flow has not been implemented yet.

The repo currently has a basic Next.js web shell, a documented decision to migrate toward a Vite and React Router client-first host, an initial Vite client scaffold with the shared public website shell and auth UX ported, a minimal Tailwind styling foundation, static public routes, a basic Hono API shell, a working health route, shared platform contracts, an initial product registry, an extractable Socratic Draft product package shape, host-owned in-memory and Prisma-backed conversation adapters, product-owned Socratic Draft client and API route entrypoints, Better Auth magic-link auth with Prisma tables, a Neon `dev` database branch with committed migrations applied, and context files for future Codex tasks.

## Implemented

- Monorepo structure with `apps/web`, `apps/api`, and the intended `packages/*` boundaries.
- Root `pnpm` workspace configuration.
- Root TypeScript configuration.
- Repo-root absolute TypeScript import rule with workspace path resolution.
- Basic `apps/web` Next.js landing page.
- Minimal `apps/web` Tailwind styling foundation and small owned site components.
- Accessibility-first UI guidance: semantic HTML first, React Aria Components for future complex interactive UI when genuinely needed.
- Public site accessibility baseline with skip link, semantic landmarks, visible focus states, and documented alt text policy.
- Static public routes for `/` and `/about`; authenticated product routes under `/products`.
- Minimal Socratic Draft editor route at `/products/socratic-draft/editor`.
- Product-owned client request helper for the conversation endpoint.
- Host-owned catch-all products route at `/products/[[...productPath]]` that dispatches into product-owned route handling.
- Socratic Draft-owned client app surface under `packages/products/src/socratic-draft/client`.
- Socratic Draft-owned API route surface under `packages/products/src/socratic-draft/server/http`.
- API host mount for product API routes under `/products`.
- Product route access requirements for authenticated and owner-only Socratic Draft routes.
- Product roadmap context for The Socratic Draft and the future Care Calendar health-tech learning product.
- Client-first host architecture decision: move toward Vite and React Router in staged tasks.
- Initial `apps/client` Vite and React Router scaffold with placeholder routes and dev proxy config.
- Shared public website shell ported into `apps/client`, including skip link, header/nav, footer, prose/layout primitives, and current public route content.
- Better Auth magic-link login, login verification, logout, session-aware header state, and client-side `/products` gating ported into `apps/client`.
- Product mounting ported into the Vite client through React Router, with Socratic Draft overview, editor, and entries routes dispatched from the host into the product-owned route renderer.
- Security posture for the future client host: client route gates are UX only; API/server authorization is authoritative.
- Next.js local API rewrite for `/api/*` to the Hono API host.
- Next.js local auth rewrite for `/auth/*` to the Better Auth route on the Hono API host.
- Basic `apps/api` Hono server.
- `GET /health` API route.
- Better Auth handler mounted at `/auth/*` on the API host.
- `POST /products/socratic-draft/conversation/respond` API route mounted by the host and handled by the Socratic Draft product package.
- Minimal magic-link sign-in page at `/sign-in`.
- Owner-only Socratic Draft entries placeholder route at `/products/socratic-draft/entries`.
- `packages/shared` API response, user/access, writing, usage, and product registry types.
- Product registry containing The Socratic Draft, with lookup helpers by id and slug.
- Socratic Draft-owned shared conversation/domain contract types under `packages/products`.
- Minimal Socratic Draft server conversation service with contract-focused tests.
- Socratic Draft product-owned `EntryStore` persistence port.
- Host/API-owned in-memory `EntryStore` adapter for the conversation endpoint.
- Prisma schema and generated initial SQL migration for Socratic Draft entries and conversation messages.
- Prisma schema and generated SQL migration for Better Auth users, sessions, accounts, and verifications.
- Prisma-backed Socratic Draft `EntryStore` adapter in `packages/db`.
- DB-side Socratic Draft entry-store resolver that uses Prisma for owner sessions when `DATABASE_URL` is set and uses in-memory storage for signed-in non-owner sessions or no-DB local fallback.
- Strict Prisma migration workflow: schema first, generated migrations only, no hand-edited migration files.
- Neon Postgres development database setup with a `dev` branch and applied initial migration.
- Local development docs and `.env.example` for database environment setup.
- Root `pnpm test` command using Vitest.
- Initial `packages/auth` access-level helper.
- Initial `packages/ai` LLM interface and fake LLM client.
- Initial Prisma-backed `packages/db` database client and Socratic Draft repository adapter.
- Initial `packages/products` package boundary.
- Standard product package shape using `shared`, `server`, and `client` boundaries.
- Product dependency boundary: products define required contracts, hosts provide infrastructure adapters.
- `AGENTS.md` repo instructions for future agents.
- Repo-native code quality and testing guidelines.
- `docs/decisions.md` decision log.
- Socratic Draft product planning docs live in `docs/products/socratic-draft/`.
- `tasks/README.md` task index.
- `tasks/001-scaffold-repo.md` scaffold/context task record.

## Partially implemented

- Product registry exists as a shared constant and is used by the static products page.
- `packages/ai` has a package boundary and initial stubs only.
- The Socratic Draft conversation service returns a deterministic stub response only; it is not yet backed by readiness logic or an LLM.
- The Socratic Draft endpoint persists through Prisma only for owner sessions when `DATABASE_URL` is configured; signed-in non-owner sessions use ephemeral in-memory storage.

## Not implemented

- Public writing system.
- Individual writing pages.
- Real AI provider integration.
- Demo ephemeral writing mode.
- Usage limits and cost protection.
- Publishing flow from private entries to public writing.
- Admin UI.

## Known gaps / risks

- The current homepage is an empty writing collection and should not be treated as the finished public writing system.
- The fake LLM client exists only to establish the package boundary; it is not wired to product behaviour.
- The Socratic Draft conversation service is deliberately minimal and currently establishes contract shape rather than final assistant behaviour.
- Product-owned ports for AI, auth/access, and usage have not been introduced yet; they should be added only when a product service genuinely needs those dependencies.
- The Neon dev database is configured locally through `.env.local`, but those secrets are intentionally not committed.
- The in-memory conversation adapter remains the no-DB local fallback.
- The current Socratic Draft editor UI is product-owned but remains a minimal wiring proof, not the final Socratic Draft product interface.
- Demo writing persistence rules are enforced at the current conversation endpoint boundary, but broader usage limits still need a later task.
- Auth exists as a minimal foundation, but production cookie/domain settings may need a deployment-specific pass later.
- Database, AI, usage, and admin boundaries exist but do not yet contain real implementation.
- The client-first host migration has started, but the deprecated Next.js `apps/web` host still exists until a later removal task.

## Next recommended task

Task 020 — Remove the deprecated Next app.
