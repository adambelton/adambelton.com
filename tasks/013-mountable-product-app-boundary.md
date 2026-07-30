# Task 013 — Mountable Product App Boundary

## Status

Complete.

## Goal

Move Socratic Draft client UI and product-relative routing into the Socratic Draft product package, while keeping the Next.js file-system routing in the web host.

## Why This Task Is Next

The current Socratic Draft editor UI lives under `apps/web`, which blurs the boundary between host application and product. Auth should be added after this boundary is corrected, so the host can gate mounted product apps without the product knowing about Next.js, sessions, or route files.

## Scope

- Add a product-owned Socratic Draft app surface under `packages/products/src/socratic-draft/client`.
- Move the Socratic Draft overview/editor UI and product-specific client request helper out of `apps/web`.
- Add product-relative route handling for Socratic Draft, such as root and editor segments.
- Replace product-specific web route files with a single host catch-all route at `apps/web/app/products/[[...productPath]]/page.tsx`.
- Keep `/products` as the host-owned products overview.
- Dispatch `/products/socratic-draft` and `/products/socratic-draft/editor` through the Socratic Draft product app surface.
- Document the host/product routing boundary.
- Update task/progress context after implementation.

## Out Of Scope

- Owner auth, Better Auth, magic links, or email delivery.
- Database schema changes or Prisma migrations.
- New product behaviour.
- Product-specific redesign work.
- Publishing, private writing lists, usage limits, or permissions.
- Next.js route files inside `packages/products`.
- React Aria usage beyond existing installed dependency decisions.

## Expected Files To Create Or Modify

- `packages/products/src/socratic-draft/client/index.ts`
- `packages/products/src/socratic-draft/client/app/*`
- `apps/web/app/products/[[...productPath]]/page.tsx`
- `apps/web/app/products/page.tsx`
- `apps/web/app/products/socratic-draft/page.tsx`
- `apps/web/app/products/socratic-draft/editor/page.tsx`
- `apps/web/app/products/socratic-draft/editor/*`
- `packages/products/package.json`
- `packages/products/tsconfig.json`
- `pnpm-lock.yaml`
- `docs/decisions.md`
- `progress.md`
- `tasks/README.md`
- `tasks/013-mountable-product-app-boundary.md`

## Definition Of Done

- `/products` renders the host-owned products overview through the catch-all route.
- `/products/socratic-draft` renders the product-owned Socratic Draft root page.
- `/products/socratic-draft/editor` renders the product-owned Socratic Draft editor.
- Socratic Draft client UI and product-specific request helpers live under `packages/products/src/socratic-draft/client`.
- The Socratic Draft product package does not import Next.js APIs.
- `apps/web` owns only routing, layout, host dispatch, and platform shell concerns.
- Repo-root absolute imports are preserved.
- Existing behaviour is preserved; no new product behaviour is added.
- Project docs record the routing boundary.

## Validation Commands

```txt
pnpm test
pnpm typecheck
rg -n "from ['\"]\\.|import ['\"]\\." apps packages --glob '!packages/db/src/generated/**'
rg -n "(from|import|export).*['\"]@adambelton/" apps packages --glob '!**/package.json' --glob '!packages/db/src/generated/**'
```

## Risks / Questions

- The product will still depend on React for client rendering, but it should not depend on Next.js. That keeps it mountable without pretending it is framework-free.
- The catch-all route requires removing overlapping product-specific route files from `apps/web` so the host route map stays clear.
- The product root page can remain minimal for now; this task is about ownership and routing shape, not final product UI.

## Completed Notes

- Replaced the product-specific Next.js route files under `apps/web/app/products` with one host catch-all route.
- Moved the Socratic Draft overview page, editor page, editor components, request helper, and request-helper test into the Socratic Draft product package.
- Added a product-owned `renderSocraticDraftRoute` route renderer that accepts product-relative segments and returns a neutral route result.
- Kept Next.js-specific behaviour in the host route, including `notFound`.
- Updated the products package to typecheck TSX client code and declare React as part of its client surface.
- Removed stale generated `.next` route type cache before rerunning typecheck.

## Validation Results

```txt
pnpm install
pnpm test
pnpm typecheck
rg -n "from ['\"]\\.|import ['\"]\\." apps packages --glob '!packages/db/src/generated/**'
rg -n "(from|import|export).*['\"]@adambelton/" apps packages --glob '!**/package.json' --glob '!packages/db/src/generated/**'
```

All validation passed. Both import-rule checks returned no matches.
