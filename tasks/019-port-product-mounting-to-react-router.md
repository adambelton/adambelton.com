# Task 019 — Port Product Mounting To React Router

## Status

Complete.

## Goal

Port product mounting from the deprecated Next host into the Vite client using React Router, including the current Socratic Draft editor route.

## Why This Task Is Next

The Vite client now owns the public shell and auth UX. Product mounting is the remaining major host capability still living in `apps/web`.

## Scope

- Add a Vite client route for `/products/:productSlug/*`.
- Dispatch product paths from the host into product-owned route renderers.
- Mount the existing Socratic Draft overview, editor, and entries routes.
- Preserve owner-only access handling for product routes that require it.
- Add minimal contract-focused tests for host product route resolution.
- Update task/progress docs.

## Out Of Scope

- Do not remove `apps/web`.
- Do not redesign the Socratic Draft UI.
- Do not change persistence, publishing, auth, or AI behavior.
- Do not add new product routes beyond the existing Socratic Draft routes.
- Do not commit until reviewed and explicitly approved.

## Expected Files To Create Or Modify

- `apps/client/src/App.tsx`
- `apps/client/src/products/*`
- `progress.md`
- `tasks/README.md`
- `tasks/019-port-product-mounting-to-react-router.md`

## Definition Of Done

- `/products/socratic-draft` renders through the Vite client.
- `/products/socratic-draft/editor` renders through the Vite client.
- `/products/socratic-draft/entries` preserves owner-only access handling.
- Unknown product routes produce a not-found state.
- The product package remains the source of truth for Socratic Draft route behavior.
- Existing auth gating still protects product routes.

## Validation Commands

```txt
pnpm --filter @adambelton/client typecheck
pnpm --filter @adambelton/client build
pnpm test
git diff --check
```

Browser validation:

```txt
pnpm dev:api
pnpm dev:client
```

Verify:

```txt
/products
/products/socratic-draft
/products/socratic-draft/editor
/products/socratic-draft/entries
/products/not-real
```

## Risks / Questions

- Client-side owner checks are only a UX boundary; API/server authorization remains authoritative.
- `apps/web` still contains the older Next mount until a later removal task.

## Completed Notes

- Added a Vite client product mount at `/products/:productSlug/*`.
- Added a host-owned product route page that dispatches Socratic Draft URLs into the Socratic Draft product-owned route renderer.
- Mounted the existing Socratic Draft overview, editor, and entries routes through React Router.
- Preserved owner-only route handling for product routes that require owner access.
- Added contract-focused tests for host product route resolution.
- Added React Router `matchPath` coverage for the product route pattern.
- Kept the route page with the other Vite client pages and left `apps/client/src/products` for product mounting helpers.
- Replaced product id and status literals with shared enum-like constants.

## Validation Results

```txt
pnpm --filter @adambelton/client typecheck
pnpm --filter @adambelton/client build
pnpm test
git diff --check
```

All validation commands passed.

Browser smoke test confirmed signed-out product URLs redirect to `/login`.
Signed-in product route rendering was covered by route resolution tests in this
task; a signed-in browser pass should be repeated during review.
