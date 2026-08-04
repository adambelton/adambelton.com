# Task 013 — Mountable Product App Boundary

## Status

Complete.

## Goal

Move ThoughtForm client UI and product-relative routing into the ThoughtForm product package, while keeping the Next.js file-system routing in the web host.

## Why This Task Is Next

The current ThoughtForm editor UI lives under `apps/web`, which blurs the boundary between host application and product. Auth should be added after this boundary is corrected, so the host can gate mounted product apps without the product knowing about Next.js, sessions, or route files.

## Scope

- Add a product-owned ThoughtForm app surface under `packages/products/src/thoughtform/client`.
- Move the ThoughtForm overview/editor UI and product-specific client request helper out of `apps/web`.
- Add product-relative route handling for ThoughtForm, such as root and editor segments.
- Replace product-specific web route files with a single host catch-all route at `apps/web/app/products/[[...productPath]]/page.tsx`.
- Keep `/products` as the host-owned products overview.
- Dispatch `/products/thoughtform` and `/products/thoughtform/editor` through the ThoughtForm product app surface.
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

- `packages/products/src/thoughtform/client/index.ts`
- `packages/products/src/thoughtform/client/app/*`
- `apps/web/app/products/[[...productPath]]/page.tsx`
- `apps/web/app/products/page.tsx`
- `apps/web/app/products/thoughtform/page.tsx`
- `apps/web/app/products/thoughtform/editor/page.tsx`
- `apps/web/app/products/thoughtform/editor/*`
- `packages/products/package.json`
- `packages/products/tsconfig.json`
- `pnpm-lock.yaml`
- `docs/decisions.md`
- `progress.md`
- `tasks/README.md`
- `tasks/013-mountable-product-app-boundary.md`

## Definition Of Done

- `/products` renders the host-owned products overview through the catch-all route.
- `/products/thoughtform` renders the product-owned ThoughtForm root page.
- `/products/thoughtform/editor` renders the product-owned ThoughtForm editor.
- ThoughtForm client UI and product-specific request helpers live under `packages/products/src/thoughtform/client`.
- ThoughtForm product package does not import Next.js APIs.
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
- Moved the ThoughtForm overview page, editor page, editor components, request helper, and request-helper test into the ThoughtForm product package.
- Added a product-owned `renderThoughtFormRoute` route renderer that accepts product-relative segments and returns a neutral route result.
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
