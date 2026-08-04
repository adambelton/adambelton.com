# Task 002 — Shared Types and Product Registry

Status: Complete

## Goal

Create the shared type layer and product registry for Adam's personal website and product demo platform.

These contracts are the types future frontend, API, database, auth, AI, and product-specific code should import instead of recreating ad hoc local versions.

## Scope

- API response and error shapes
- User, current-user, and access-level types
- Product definition types
- Site-level public writing post types
- Product-aware usage event types
- ThoughtForm shared conversation model
- Initial product registry with ThoughtForm
- Shared package barrel exports

## Out of Scope

- Frontend products page
- Writing pages
- New API routes
- Auth implementation
- Database schema or repositories
- AI provider clients
- ThoughtForm conversation service
- Editor UI
- Demo mode
- Usage limits
- Publishing flow
- Admin UI

## Definition of Done

- Shared types exist in `packages/shared`
- ThoughtForm conversation model is defined in `packages/shared`
- Product registry exists and includes ThoughtForm
- Shared package exports are clean
- No duplicate shared types are created in apps
- No runtime product behaviour is implemented
- `pnpm typecheck` passes
- `progress.md` is updated
- `tasks/README.md` is updated
- This task file exists and reflects actual status

## Completed Notes

- Added shared API, user/access, product, writing, usage, and ThoughtForm contract exports.
- Added `getProductById` and `getProductBySlug` helpers.
- Kept the work contract-only: no new runtime product behaviour was added.
- `pnpm typecheck` passes.
