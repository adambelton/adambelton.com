# Task 047 — Lazy-load the ThoughtForm product client

## Goal

Keep ThoughtForm out of the initial public-site JavaScript bundle and load its
client code only when a visitor opens a ThoughtForm route.

## Why this task is next

The host currently imports the product mount eagerly, which brings the complete
editor, Draft interface, React Aria dialogs, and supporting workspace code into
every public page. Task 046 exposed a 634 KB minified single client chunk; route
splitting is the clearest first reduction.

## Scope

- Lazy-load the host product-route mount at `/products/:productSlug/*`.
- Keep the public product catalogue in the initial host application.
- Provide a visually consistent accessible loading state.
- Preserve public product information and owner-only workspace access.
- Verify generated chunks and record before/after minified and gzip sizes.
- Update focused tests, task status, and `progress.md`.

## Out of scope

- Splitting individual ThoughtForm routes from one another.
- Build-time Markdown compilation, auth splitting, manual vendor chunks, or
  product/API behaviour changes.

## Expected files to create or modify

- host bootstrap and product-mount imports
- a focused host product-loading component and test
- task index and `progress.md`

## Definition of done

- Public website routes do not include the ThoughtForm client in their initial
  chunk.
- Direct and internal ThoughtForm navigation loads the product correctly.
- Access boundaries are unchanged.
- Build output contains a smaller initial chunk and a separate product chunk.
- Tests, typecheck, build, Playwright, mounted inspection, and diff checks pass.

## Validation commands

```txt
pnpm test
pnpm typecheck
pnpm build
pnpm exec playwright test
git diff --check
```

## Risks / questions

- The complete product initially remains one lazy chunk. Further product-route
  splitting should be proposed only after measuring this boundary.
- The fallback must communicate loading without making an access decision.

## Approval record

Approved by Adam on 2026-08-06.

- **Intentional boundary:** split the product mount only; keep catalogue,
  content, auth, and product internals unchanged.
- **Important deferrals:** product-internal route splitting, build-time content
  processing, and manual vendor chunking.
- **Implementation decision:** use the host router's React lazy/Suspense boundary
  and prove the generated module placement.
- **Decision not to reopen:** product access policy remains exactly as completed
  by Task 046.

## Status

Complete.

## Completion audit

- **Lazy host boundary:** `App.tsx` uses React lazy/Suspense for the host
  `ProductRoutePage`; the catalogue and product-path declaration remain eager.
- **Accessible fallback:** the host-owned `ProductRouteLoading` exposes a named
  section, polite live region, and status text with focused rendering coverage.
- **Generated output:** the former single 634.42 KB / 199.36 KB gzip chunk became
  a 532.74 KB / 167.80 KB gzip initial chunk plus a 103.32 KB / 32.67 KB gzip
  product chunk. Module inspection places ConversationEditor, DraftPanel, and
  React Aria in the product chunk rather than the initial chunk.
- **Access boundary:** no product or API access declarations changed. Existing
  public-overview and owner-workspace tests pass unchanged.
- **Validation:** 284 unit tests passed with five hosted tests skipped;
  repository typecheck and build passed; all three Chromium product journeys
  passed; `git diff --check` passed.
- **Mounted verification:** real client/API hosts started with no pending
  migrations. Internal navigation from Home through Products loaded the
  ThoughtForm overview, and the existing owner session continued into the
  workspace. This was browser inspection, not human assistive-technology
  verification.
- **Branch audit:** the complete Task 047 diff contains only host loading,
  import-boundary, test, and record changes. No product behaviour, API, schema,
  persistence, or access-policy implementation changed.
